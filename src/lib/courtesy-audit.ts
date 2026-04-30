// src/lib/courtesy-audit.ts
// Trilha de auditoria de TODO evento do fluxo de cortesia.
// Persistente em DB (CourtesyAuditLog), totalmente portavel, observable.

import prisma from "@/lib/prisma"

export type CourtesyAuditEvent =
  | "eligibility.created"
  | "eligibility.blocked_by_email"
  | "eligibility.first_appointment"
  | "eligibility.expired"
  | "eligibility.lazy_expire_no_appointment"
  | "approval.started"
  | "approval.key_created"
  | "approval.email_attempt"
  | "approval.email_sent"
  | "approval.email_failed"
  | "approval.completed"
  | "rejection.completed"
  | "redemption.attempted"
  | "redemption.completed"
  | "user.deleted_with_eligibility_kept"
  | "user.deleted_with_eligibility_removed"

type AuditPayload = {
  eligibilityId?: string | null
  email?: string | null
  message?: string | null
  payload?: Record<string, unknown> | null
}

/**
 * Grava um evento de auditoria. NUNCA falha o fluxo principal — qualquer erro
 * vai apenas pro console.
 */
export async function recordCourtesyAudit(
  event: CourtesyAuditEvent,
  data: AuditPayload = {}
) {
  try {
    await prisma.courtesyAuditLog.create({
      data: {
        event,
        eligibilityId: data.eligibilityId?.slice(0, 40) ?? null,
        email: data.email?.slice(0, 190) ?? null,
        message: data.message?.slice(0, 500) ?? null,
        payload: (data.payload as any) ?? undefined,
      },
    })
  } catch (err) {
    console.error("[courtesy-audit] failed to record:", event, err)
  }
}
