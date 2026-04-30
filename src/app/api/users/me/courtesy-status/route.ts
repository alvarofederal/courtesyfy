// Retorna se o usuario logado tem cortesia ativa.
// Usado pelo sidebar para mostrar/esconder o item "Minha Cortesia".

export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { differenceInDays } from "date-fns"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ active: false, daysLeft: null })
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: {
      plan: true,
      status: true,
      stripeCustomerId: true,
      stripeCurrentPeriodEnd: true,
    },
  })

  const isActive =
    sub?.plan === "COURTESY" &&
    sub.status === "active" &&
    sub.stripeCustomerId?.startsWith("courtesy_") === true

  const daysLeft =
    isActive && sub?.stripeCurrentPeriodEnd
      ? Math.max(0, differenceInDays(sub.stripeCurrentPeriodEnd, new Date()))
      : null

  return NextResponse.json({ active: !!isActive, daysLeft })
}
