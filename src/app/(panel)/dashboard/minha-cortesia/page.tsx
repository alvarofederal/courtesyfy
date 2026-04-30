// /dashboard/minha-cortesia
// Pagina visivel apenas para profissional com cortesia ativa.
// Mostra detalhes da SUA cortesia (nao admin).

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  MapPin,
  Briefcase,
  Bell,
  BarChart3,
  QrCode,
  Globe,
  ArrowLeft,
  Crown,
} from "lucide-react"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { ptBR } from "date-fns/locale"

export const dynamic = "force-dynamic"

const FEATURES = [
  { icon: MapPin, label: "Multi-endereço de atendimento" },
  { icon: Briefcase, label: "10 tipos de atendimento" },
  { icon: Globe, label: "Página pública profissional" },
  { icon: QrCode, label: "QR Code para compartilhar" },
  { icon: Bell, label: "Lembretes ilimitados por agendamento" },
  { icon: BarChart3, label: "Relatórios completos com export" },
  { icon: Calendar, label: "Calendário com status visual" },
  { icon: CheckCircle2, label: "Suporte prioritário via Chamados" },
]

export default async function MinhaCortesiaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role === "ADMIN") redirect("/dashboard")

  const [subscription, eligibility] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: {
        plan: true,
        status: true,
        stripeCustomerId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
      },
    }),
    prisma.courtesyEligibility.findUnique({
      where: { userId: session.user.id },
    }),
  ])

  const isCourtesyActive =
    subscription?.plan === "COURTESY" &&
    subscription.status === "active" &&
    subscription.stripeCustomerId?.startsWith("courtesy_") === true

  // Sem cortesia ativa? Manda pro dashboard.
  if (!isCourtesyActive) redirect("/dashboard")

  const validUntil = subscription?.stripeCurrentPeriodEnd
  const daysLeft = validUntil ? differenceInDays(validUntil, new Date()) : 0
  const totalDays = subscription?.createdAt && validUntil
    ? differenceInDays(validUntil, subscription.createdAt)
    : 90
  const usedDays = Math.max(0, totalDays - daysLeft)
  const progress = Math.min(100, Math.round((usedDays / totalDays) * 100))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
        </Link>

        {/* Header destacado */}
        <Card className="border-2 border-emerald-300 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold tracking-widest text-emerald-100 mb-1">
                  PLANO ATIVO • CORTESIA
                </div>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                  Você tem acesso completo
                </h1>
                <p className="text-emerald-50 mt-2">
                  Aproveite tudo que a Basemedical oferece, sem custo.
                </p>
              </div>
            </div>

            {/* Barra de progresso da cortesia */}
            {validUntil && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <div className="text-5xl font-black leading-none">{daysLeft}</div>
                    <div className="text-emerald-100 text-sm mt-1">
                      {daysLeft === 1 ? "dia restante" : "dias restantes"}
                    </div>
                  </div>
                  <div className="text-right text-sm text-emerald-100">
                    Válida até
                    <div className="font-bold text-white text-base">
                      {format(validUntil, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${100 - progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Como você chegou aqui */}
        {eligibility && (
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-base text-gray-700 flex items-center gap-2">
                <Crown className="w-4 h-4 text-emerald-600" />
                Como você ganhou esta cortesia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">📍</span>
                <span>
                  Vindo da landing{" "}
                  <code className="text-xs bg-emerald-50 px-1.5 py-0.5 rounded">
                    /para/{eligibility.landing}
                  </code>
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold mt-0.5">📅</span>
                <span>
                  Cadastrou em{" "}
                  <strong>
                    {format(eligibility.registeredAt, "dd 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </strong>
                </span>
              </div>
              {eligibility.firstAppointmentAt && (
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">✅</span>
                  <span>
                    Primeiro paciente agendou em{" "}
                    <strong>
                      {format(eligibility.firstAppointmentAt, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </strong>{" "}
                    — você cumpriu o desafio!
                  </span>
                </div>
              )}
              {eligibility.approvedAt && (
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold mt-0.5">🎁</span>
                  <span>
                    Cortesia aprovada em{" "}
                    <strong>
                      {format(eligibility.approvedAt, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tudo que está desbloqueado */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-base text-gray-700">
              Tudo que está desbloqueado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100"
                >
                  <f.icon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-800">{f.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA de upgrade */}
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-6 text-center">
            <Crown className="w-10 h-10 text-amber-600 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-gray-900">
              Não perca o acesso quando a cortesia acabar
            </h3>
            <p className="text-sm text-gray-700 mt-1 mb-4">
              Migre pro plano pago a qualquer momento e mantenha tudo ativo,
              sem interrupção.
            </p>
            <Link
              href="/dashboard/plans"
              className="inline-block px-6 py-3 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md"
            >
              Ver planos disponíveis
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
