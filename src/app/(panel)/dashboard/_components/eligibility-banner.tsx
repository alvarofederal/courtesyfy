// Banner que mostra ao profissional o status da sua cortesia condicional
// vinda da landing. Server component — busca direto do banco.

import prisma from "@/lib/prisma"
import { Gift, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

export async function EligibilityBanner({ userId }: { userId: string }) {
  const eligibility = await prisma.courtesyEligibility.findUnique({
    where: { userId },
  })

  if (!eligibility) return null

  // PENDING: contagem regressiva
  if (eligibility.status === "PENDING_APPOINTMENT") {
    const remainingMs = eligibility.eligibilityDeadline.getTime() - Date.now()
    if (remainingMs <= 0) return null // sera marcado EXPIRED em algum read futuro
    const remainingH = Math.floor(remainingMs / (60 * 60 * 1000))
    const remainingM = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000))

    return (
      <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base md:text-lg">
              🎁 Você está a 1 paciente de ganhar 3 meses grátis
            </p>
            <p className="text-sm text-gray-700 mt-1">
              Compartilhe seu link público com pacientes. Quando o primeiro
              agendar pela sua página, sua cortesia entra em análise.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white/70 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              Faltam {remainingH}h {remainingM}min
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ELIGIBLE: aguardando aprovação do admin
  if (eligibility.status === "ELIGIBLE") {
    return (
      <div className="rounded-xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50 p-4 md:p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 text-white flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base md:text-lg">
              ✅ Seu primeiro paciente agendou!
            </p>
            <p className="text-sm text-gray-700 mt-1">
              Sua cortesia de 3 meses está em análise pelo nosso time. Assim
              que aprovada, você recebe o código por email.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // APPROVED: cortesia liberada — mostra somente enquanto o profissional
  // ainda nao usou ativamente o sistema. Criterios pra ESCONDER (2 ja usou):
  //   - 2+ agendamentos PUBLIC desde o cadastro (claramente ja integrou na rotina)
  //   - OU mais de 7 dias desde a aprovacao (fallback de seguranca)
  if (eligibility.status === "APPROVED" && eligibility.approvedAt) {
    const daysSince = Math.floor(
      (Date.now() - eligibility.approvedAt.getTime()) / (24 * 60 * 60 * 1000)
    )
    if (daysSince > 7) return null

    const publicApptCount = await prisma.appointment.count({
      where: {
        userId,
        source: "PUBLIC",
        createdAt: { gte: eligibility.registeredAt },
      },
    })
    if (publicApptCount >= 2) return null

    return (
      <div className="rounded-xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50 p-4 md:p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-base md:text-lg">
              🎉 3 meses de cortesia liberados!
            </p>
            <p className="text-sm text-gray-700 mt-1">
              Verifique seu email — enviamos o código de ativação. Pra usar
              agora, vá em{" "}
              <Link href="/dashboard/courtesies/redeem" className="font-semibold text-emerald-700 underline">
                Cortesias
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    )
  }

  // EXPIRED: aviso suave (mostra por 3 dias)
  if (eligibility.status === "EXPIRED") {
    const daysSince = Math.floor(
      (Date.now() - eligibility.eligibilityDeadline.getTime()) / (24 * 60 * 60 * 1000)
    )
    if (daysSince > 3) return null

    return (
      <div className="rounded-xl border border-gray-300 bg-gray-50 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">
              A janela de 48h para a cortesia condicional expirou. Você pode
              continuar usando a Basemedical normalmente — fale com a gente em{" "}
              <Link href="/dashboard/issues" className="font-semibold underline">
                Chamados
              </Link>{" "}
              se quiser reativar.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
