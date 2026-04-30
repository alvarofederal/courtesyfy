"use server"

import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { generateCourtesyKey } from "@/utils/courtesy/generate-key"
import { sendCourtesyApprovalEmail } from "@/lib/email-courtesy-approval"
import { recordCourtesyAudit } from "@/lib/courtesy-audit"

const COURTESY_VALIDITY_DAYS = 90 // 3 meses

/** Batch ID para chaves geradas automaticamente via aprovacao de elegibilidade. */
function buildEligibilityBatchId(landing: string): string {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  return `eligibility_${landing}_${today}`
}

/**
 * Aprova uma elegibilidade:
 * - Gera CourtesyKey unica com validade de 3 meses
 * - Atualiza eligibility para APPROVED
 * - Dispara email caprichado pro profissional
 *
 * Ja existe key (ex: re-aprovacao acidental)? Faz update idempotente.
 */
export async function approveEligibility(eligibilityId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Não autorizado" }
  }

  const eligibility = await prisma.courtesyEligibility.findUnique({
    where: { id: eligibilityId },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  if (!eligibility) return { error: "Elegibilidade não encontrada" }
  if (eligibility.status !== "ELIGIBLE") {
    return { error: `Status atual é ${eligibility.status}, não pode aprovar` }
  }
  const targetEmail = eligibility.user?.email ?? eligibility.email
  if (!targetEmail) return { error: "Profissional sem email cadastrado" }

  await recordCourtesyAudit("approval.started", {
    eligibilityId,
    email: targetEmail,
    message: `Admin ${session.user.id} iniciou aprovacao`,
  })

  // 1. Gera chave unica em batch dedicado (rastreabilidade)
  const code = generateCourtesyKey()
  const validUntil = new Date(Date.now() + COURTESY_VALIDITY_DAYS * 24 * 60 * 60 * 1000)
  const batchId = buildEligibilityBatchId(eligibility.landing)

  const courtesy = await prisma.courtesyKey.create({
    data: {
      code,
      validUntil,
      batchId,
      createdByAdminId: session.user.id,
    },
  })
  await recordCourtesyAudit("approval.key_created", {
    eligibilityId,
    email: targetEmail,
    message: `Chave ${code} gerada no batch ${batchId}`,
    payload: { courtesyKeyId: courtesy.id, code, validUntil, batchId },
  })

  // 2. Atualiza eligibility
  await prisma.courtesyEligibility.update({
    where: { id: eligibilityId },
    data: {
      status: "APPROVED",
      approvedByUserId: session.user.id,
      approvedAt: new Date(),
      courtesyKeyId: courtesy.id,
    },
  })

  // 3. Email pro profissional. Tudo logado.
  await recordCourtesyAudit("approval.email_attempt", {
    eligibilityId,
    email: targetEmail,
    message: "Tentando enviar email via Resend",
    payload: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      to: targetEmail,
    },
  })
  let emailSent = false
  let emailError: string | undefined
  try {
    const r = await sendCourtesyApprovalEmail({
      to: targetEmail,
      professionalName: eligibility.user?.name ?? null,
      courtesyCode: code,
      validUntil,
    })
    emailSent = !!r
    if (!r) {
      emailError = "RESEND_API_KEY ausente ou config invalida"
      await recordCourtesyAudit("approval.email_failed", {
        eligibilityId,
        email: targetEmail,
        message: emailError,
      })
    } else {
      await recordCourtesyAudit("approval.email_sent", {
        eligibilityId,
        email: targetEmail,
        message: `Resend OK — id ${r.id ?? "(sem id)"}`,
        payload: { resendId: r.id ?? null },
      })
    }
  } catch (err) {
    console.error("[approve-eligibility] email failed:", err)
    emailError = err instanceof Error ? err.message : "Erro desconhecido"
    await recordCourtesyAudit("approval.email_failed", {
      eligibilityId,
      email: targetEmail,
      message: emailError,
      payload: { stack: err instanceof Error ? err.stack?.slice(0, 1000) : null },
    })
  }

  await recordCourtesyAudit("approval.completed", {
    eligibilityId,
    email: targetEmail,
    message: `Aprovacao concluida (emailSent=${emailSent})`,
    payload: { code, emailSent, emailError: emailError ?? null },
  })

  revalidatePath("/dashboard/courtesies/eligibles")
  return { success: true, code, batchId, emailSent, emailError }
}

/**
 * Reenvia o email de aprovacao usando a chave ja gerada. Util quando o envio
 * inicial falhou (ex: env var ausente, bounce, spam) e admin precisa avisar
 * o profissional sem regerar a cortesia.
 */
export async function resendCourtesyEmail(eligibilityId: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Não autorizado" }
  }

  const eligibility = await prisma.courtesyEligibility.findUnique({
    where: { id: eligibilityId },
    include: { user: { select: { email: true, name: true } } },
  })
  if (!eligibility) return { error: "Elegibilidade não encontrada" }
  if (eligibility.status !== "APPROVED" || !eligibility.courtesyKeyId) {
    return { error: "Elegibilidade ainda não foi aprovada" }
  }
  const targetEmail = eligibility.user?.email ?? eligibility.email
  if (!targetEmail) return { error: "Profissional sem email cadastrado" }

  const key = await prisma.courtesyKey.findUnique({
    where: { id: eligibility.courtesyKeyId },
  })
  if (!key) return { error: "Chave não encontrada" }

  await recordCourtesyAudit("approval.email_attempt", {
    eligibilityId,
    email: targetEmail,
    message: "Reenvio manual disparado pelo admin",
    payload: { hasResendKey: !!process.env.RESEND_API_KEY, code: key.code },
  })
  try {
    const r = await sendCourtesyApprovalEmail({
      to: targetEmail,
      professionalName: eligibility.user?.name ?? null,
      courtesyCode: key.code,
      validUntil: key.validUntil,
    })
    if (!r) {
      const msg = "RESEND_API_KEY ausente. Configure a variável de ambiente."
      await recordCourtesyAudit("approval.email_failed", {
        eligibilityId,
        email: targetEmail,
        message: msg,
      })
      return { error: msg }
    }
    await recordCourtesyAudit("approval.email_sent", {
      eligibilityId,
      email: targetEmail,
      message: `Reenvio OK — Resend id ${r.id ?? "(sem id)"}`,
      payload: { resendId: r.id ?? null, manual: true },
    })
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? `Falha ao enviar: ${err.message}` : "Falha ao enviar email"
    await recordCourtesyAudit("approval.email_failed", {
      eligibilityId,
      email: targetEmail,
      message: msg,
      payload: { stack: err instanceof Error ? err.stack?.slice(0, 1000) : null },
    })
    return { error: msg }
  }
}

/** Rejeita elegibilidade com motivo (visivel pro admin no historico). */
export async function rejectEligibility(eligibilityId: string, reason: string) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Não autorizado" }
  }

  const trimmed = (reason || "").trim().slice(0, 500)
  if (!trimmed) return { error: "Motivo obrigatório" }

  const eligibility = await prisma.courtesyEligibility.findUnique({
    where: { id: eligibilityId },
  })
  if (!eligibility) return { error: "Elegibilidade não encontrada" }
  if (eligibility.status !== "ELIGIBLE") {
    return { error: `Status atual é ${eligibility.status}, não pode rejeitar` }
  }

  await prisma.courtesyEligibility.update({
    where: { id: eligibilityId },
    data: {
      status: "REJECTED",
      approvedByUserId: session.user.id,
      approvedAt: new Date(),
      rejectedReason: trimmed,
    },
  })

  await recordCourtesyAudit("rejection.completed", {
    eligibilityId,
    email: eligibility.email,
    message: `Admin ${session.user.id} rejeitou`,
    payload: { reason: trimmed },
  })

  revalidatePath("/dashboard/courtesies/eligibles")
  return { success: true }
}
