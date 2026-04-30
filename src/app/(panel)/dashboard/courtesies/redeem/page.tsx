// /dashboard/courtesies/redeem
// Pagina standalone de resgate de cortesia, apontada pelo email da landing
// e pelo banner do dashboard.
//
// Reusa 100% as Server Actions ja existentes:
//   - previewCourtesyKey
//   - redeemCourtesyKey
// (em ../_actions/redeem-courtesy-key.ts)
//
// Nao mexe no fluxo do FloatingCourtesyButton/CourtesyInfoModal — apenas
// adiciona uma porta de entrada alternativa pra quem chega via email.

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Sparkles, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { RedeemForm } from "./_components/redeem-form"

export const dynamic = "force-dynamic"

export default async function RedeemCourtesyPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Admin nao usa essa pagina
  if (session.user.role === "ADMIN") redirect("/dashboard")

  // Se ja tem cortesia ativa, mostra estado de sucesso ao inves do formulario
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: {
      plan: true,
      status: true,
      stripeCustomerId: true,
      stripeCurrentPeriodEnd: true,
    },
  })

  const isCourtesyActive =
    subscription?.plan === "COURTESY" &&
    subscription.status === "active" &&
    subscription.stripeCustomerId?.startsWith("courtesy_")

  const hasRealStripe =
    !!subscription?.stripeCustomerId &&
    !subscription.stripeCustomerId.startsWith("courtesy_") &&
    subscription.status === "active"

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao dashboard
        </Link>

        {/* Estado: Cortesia ja ativa */}
        {isCourtesyActive && (
          <Card className="border-2 border-emerald-300 shadow-lg bg-gradient-to-br from-emerald-50 via-white to-teal-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8" />
              </div>
              <CardTitle className="text-2xl">Cortesia já ativa</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-3 pb-8">
              <p className="text-gray-700">
                Você está com o plano completo liberado.
                {subscription?.stripeCurrentPeriodEnd && (
                  <>
                    <br />
                    Válido até{" "}
                    <strong>
                      {format(
                        new Date(subscription.stripeCurrentPeriodEnd),
                        "dd 'de' MMMM 'de' yyyy",
                        { locale: ptBR }
                      )}
                    </strong>
                    .
                  </>
                )}
              </p>
              <Link
                href="/dashboard"
                className="inline-block mt-4 px-6 py-2.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
              >
                Ir pro dashboard
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Estado: ja tem assinatura Stripe paga */}
        {!isCourtesyActive && hasRealStripe && (
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-6 h-6 text-emerald-600" />
                Você já tem plano ativo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Sua assinatura paga está em andamento — a cortesia não pode ser
                aplicada por cima dela. Se quiser usar a cortesia futuramente,
                guarde o código.
              </p>
              <Link
                href="/dashboard"
                className="inline-block mt-4 px-6 py-2.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
              >
                Voltar ao dashboard
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Estado: pode resgatar */}
        {!isCourtesyActive && !hasRealStripe && (
          <Card className="border-2 border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Gift className="w-6 h-6 text-emerald-600" />
                Resgatar cortesia
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Cole abaixo o código que você recebeu por email.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <RedeemForm />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
