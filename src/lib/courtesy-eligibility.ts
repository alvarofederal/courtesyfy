// src/lib/courtesy-eligibility.ts
// Motor de elegibilidade da cortesia condicional vinda das landings.

import prisma from "@/lib/prisma"
import { recordCourtesyAudit } from "@/lib/courtesy-audit"

/**
 * Marca eligibility como ELIGIBLE quando o profissional recebe seu 1o
 * agendamento PUBLICO dentro do prazo de 48h. Idempotente.
 *
 * Chame DEPOIS de criar o Appointment, com try/catch — nunca pode quebrar
 * o fluxo de agendamento.
 */
export async function checkCourtesyEligibility(params: {
  professionalUserId: string
  appointmentId: string
}) {
  const { professionalUserId, appointmentId } = params
  try {
    const eligibility = await prisma.courtesyEligibility.findUnique({
      where: { userId: professionalUserId },
    })

    if (!eligibility) return { changed: false, reason: "no_eligibility" }
    if (eligibility.status !== "PENDING_APPOINTMENT") {
      return { changed: false, reason: `status_${eligibility.status}` }
    }

    const now = new Date()
    if (now > eligibility.eligibilityDeadline) {
      await prisma.courtesyEligibility.update({
        where: { userId: professionalUserId },
        data: { status: "EXPIRED" },
      })
      await recordCourtesyAudit("eligibility.expired", {
        eligibilityId: eligibility.id,
        email: eligibility.email,
        message: "Tentou agendamento publico mas ja tinha passado de 48h",
        payload: { appointmentId, deadline: eligibility.eligibilityDeadline },
      })
      return { changed: true, reason: "expired" }
    }

    await prisma.courtesyEligibility.update({
      where: { userId: professionalUserId },
      data: {
        status: "ELIGIBLE",
        firstAppointmentAt: now,
        firstAppointmentId: appointmentId,
      },
    })
    await recordCourtesyAudit("eligibility.first_appointment", {
      eligibilityId: eligibility.id,
      email: eligibility.email,
      message: "1o agendamento publico recebido — ELIGIBLE para aprovacao",
      payload: { appointmentId, professionalUserId },
    })
    return { changed: true, reason: "eligible" }
  } catch (err) {
    console.error("[eligibility] check failed:", err)
    return { changed: false, reason: "error" }
  }
}

/**
 * Lazy expire: marca como EXPIRED qualquer PENDING que ja passou do prazo.
 * Chame antes de listar eligibilities no admin pra manter consistencia
 * sem precisar de cron externo.
 */
export async function expireStaleEligibilities() {
  try {
    const now = new Date()
    const { count } = await prisma.courtesyEligibility.updateMany({
      where: {
        status: "PENDING_APPOINTMENT",
        eligibilityDeadline: { lt: now },
      },
      data: { status: "EXPIRED" },
    })
    return { expired: count }
  } catch (err) {
    console.error("[eligibility] expire failed:", err)
    return { expired: 0 }
  }
}
