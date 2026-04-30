// src/lib/email-courtesy-approval.ts
import { Resend } from "resend"
import { render } from "@react-email/render"
import { CourtesyApprovalEmail } from "@/components/emails/courtesy-approval-email"

export async function sendCourtesyApprovalEmail(params: {
  to: string
  professionalName?: string | null
  courtesyCode: string
  validUntil: Date
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[courtesy-email] RESEND_API_KEY missing — skipping send")
    return null
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const html = await render(
    CourtesyApprovalEmail({
      professionalName: params.professionalName,
      courtesyCode: params.courtesyCode,
      validUntil: params.validUntil,
    })
  )

  const { data, error } = await resend.emails.send({
    from: "BaseMedical <basemedical@karollynemorais.com.br>",
    to: params.to,
    subject: "🎁 Sua cortesia de 3 meses na Basemedical está liberada",
    html,
  })

  if (error) {
    console.error("[courtesy-email] resend error:", error)
    throw new Error(`Resend error: ${error.message}`)
  }

  console.log("[courtesy-email] sent:", data?.id)
  return data
}
