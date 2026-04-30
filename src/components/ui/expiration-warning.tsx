// Aviso de expiracao proxima — exibido apenas quando faltam <= 14 dias
// para o fim do trial OU da cortesia ativa. Sempre com CTA para plans.
//
// Server component: busca subscription + createdAt do user.
// Inclui-lo em qualquer pagina autenticada do dashboard onde se queira
// mostrar o aviso (ex: /my-schedule, /dashboard/appointments).

import prisma from "@/lib/prisma"
import { addDays, differenceInDays } from "date-fns"
import { TRIAL_LIMITS } from "@/utils/permissions/trial-limits"
import Link from "next/link"
import { Sparkles, Clock } from "lucide-react"

const WARNING_THRESHOLD_DAYS = 14

export async function ExpirationWarning({ userId }: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      subscription: {
        select: {
          plan: true,
          status: true,
          stripeCustomerId: true,
          stripeCurrentPeriodEnd: true,
        },
      },
    },
  })
  if (!user) return null

  const sub = user.subscription
  const now = new Date()

  // Cortesia ativa proxima do fim?
  const isCourtesyActive =
    sub?.plan === "COURTESY" &&
    sub.status === "active" &&
    sub.stripeCustomerId?.startsWith("courtesy_") === true &&
    !!sub.stripeCurrentPeriodEnd

  if (isCourtesyActive && sub?.stripeCurrentPeriodEnd) {
    const daysLeft = differenceInDays(sub.stripeCurrentPeriodEnd, now)
    if (daysLeft >= 0 && daysLeft <= WARNING_THRESHOLD_DAYS) {
      return (
        <Banner
          tone="amber"
          icon={<Sparkles className="w-5 h-5 flex-shrink-0" />}
          title={
            daysLeft === 0
              ? "Sua cortesia expira hoje"
              : daysLeft === 1
              ? "Sua cortesia expira amanhã"
              : `Sua cortesia expira em ${daysLeft} dias`
          }
          subtitle="Garanta o plano completo antes de perder o acesso às funcionalidades."
          ctaLabel="Ver planos"
        />
      )
    }
    return null // cortesia ativa mas longe de expirar
  }

  // Tem assinatura paga real ativa? Nao mostra trial
  const hasRealStripe =
    sub?.stripeCustomerId &&
    !sub.stripeCustomerId.startsWith("courtesy_") &&
    sub.status === "active"
  if (hasRealStripe) return null

  // Trial: so avisa quando proximo do fim
  const trialEnd = addDays(new Date(user.createdAt), TRIAL_LIMITS)
  const trialDaysLeft = differenceInDays(trialEnd, now)
  if (trialDaysLeft < 0) return null // ja expirou — outros banners cuidam disso
  if (trialDaysLeft > WARNING_THRESHOLD_DAYS) return null // ainda longe — nao polui

  return (
    <Banner
      tone="amber"
      icon={<Clock className="w-5 h-5 flex-shrink-0" />}
      title={
        trialDaysLeft === 0
          ? "Seu período de teste expira hoje"
          : trialDaysLeft === 1
          ? "Seu período de teste expira amanhã"
          : `Seu período de teste expira em ${trialDaysLeft} dias`
      }
      subtitle="Continue sem interrupção — assine o plano antes do fim."
      ctaLabel="Assinar agora"
    />
  )
}

function Banner({
  icon,
  title,
  subtitle,
  ctaLabel,
}: {
  tone: "amber" | "red"
  icon: React.ReactNode
  title: string
  subtitle: string
  ctaLabel: string
}) {
  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm md:text-base px-4 py-3 my-4 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
      <div className="flex items-start gap-2">
        {icon}
        <div>
          <h3 className="font-semibold leading-tight">{title}</h3>
          <p className="text-sm text-amber-50/90 leading-tight mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      <Link
        href="/dashboard/plans"
        className="bg-white text-amber-700 hover:bg-amber-50 transition-colors px-4 py-2 rounded-md font-semibold whitespace-nowrap text-sm md:self-auto self-start"
      >
        {ctaLabel}
      </Link>
    </div>
  )
}
