"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"
import { isValidKeyFormat, normalizeKeyInput } from "@/utils/courtesy/generate-key"

const schema = z.object({
  code: z.string().min(16).max(30),
})

const GENERIC_INVALID = "Chave inválida ou já utilizada"

export type RedemptionSource = "MANUAL_KEY" | "QR_CODE"

export async function previewCourtesyKey(input: { code: string }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: "Formato de chave inválido" }

  const code = normalizeKeyInput(parsed.data.code)
  if (!isValidKeyFormat(code)) return { error: "Formato de chave inválido" }

  const rate = await checkRateLimit(`courtesy-key-preview:${session.user.id}`, 10, 60 * 60 * 1000)
  if (!rate.allowed) return { error: "Muitas tentativas. Tente novamente em 1 hora." }

  const key = await prisma.courtesyKey.findUnique({
    where: { code },
    select: { validUntil: true, redeemedAt: true },
  })

  if (!key || key.redeemedAt) return { error: GENERIC_INVALID }
  if (key.validUntil <= new Date()) return { error: "Esta chave expirou" }

  return { success: true, validUntil: key.validUntil }
}

export async function redeemCourtesyKey(input: { code: string; source?: RedemptionSource }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: "Formato de chave inválido" }

  const code = normalizeKeyInput(parsed.data.code)
  if (!isValidKeyFormat(code)) return { error: "Formato de chave inválido" }

  const rate = await checkRateLimit(`courtesy-key-redeem:${session.user.id}`, 5, 60 * 60 * 1000)
  if (!rate.allowed) return { error: "Muitas tentativas. Tente novamente em 1 hora." }

  const userId = session.user.id
  const source: RedemptionSource = input.source ?? "MANUAL_KEY"

  // Valida usuário não tem assinatura Stripe real ativa
  const existingSub = await prisma.subscription.findUnique({
    where: { userId },
    select: { stripeCustomerId: true, status: true, plan: true },
  })

  const hasRealStripe =
    existingSub &&
    existingSub.stripeCustomerId &&
    !existingSub.stripeCustomerId.startsWith("courtesy_") &&
    existingSub.status === "active"

  if (hasRealStripe) {
    return { error: "Você já possui assinatura ativa. Cortesia não aplicável." }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Resgate atômico: só atualiza se ainda não resgatada
      const redeemed = await tx.courtesyKey.updateMany({
        where: {
          code,
          redeemedAt: null,
          redeemedByUserId: null,
          validUntil: { gt: new Date() },
        },
        data: {
          redeemedAt: new Date(),
          redeemedByUserId: userId,
          redemptionSource: source,
        },
      })

      if (redeemed.count === 0) {
        throw new Error("INVALID_OR_USED")
      }

      const key = await tx.courtesyKey.findUnique({
        where: { code },
        select: { validUntil: true },
      })
      if (!key) throw new Error("INVALID_OR_USED")

      await tx.subscription.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: `courtesy_${userId}`,
          stripeSubscriptionId: `courtesy_${userId}`,
          plan: "COURTESY",
          status: "active",
          stripeCurrentPeriodEnd: key.validUntil,
        },
        update: {
          plan: "COURTESY",
          status: "active",
          stripeCurrentPeriodEnd: key.validUntil,
          canceledAt: null,
          pastDueAt: null,
        },
      })

      return { validUntil: key.validUntil }
    })

    revalidatePath("/dashboard/profile")
    return { success: true, validUntil: result.validUntil }
  } catch (error) {
    const msg = error instanceof Error ? error.message : ""
    if (msg === "INVALID_OR_USED") return { error: GENERIC_INVALID }
    console.error("[redeemCourtesyKey] Erro:", error)
    return { error: "Erro ao resgatar chave. Tente novamente." }
  }
}
