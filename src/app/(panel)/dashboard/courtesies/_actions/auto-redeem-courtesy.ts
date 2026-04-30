"use server"

import { cookies } from "next/headers"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { isValidKeyFormat, normalizeKeyInput } from "@/utils/courtesy/generate-key"

const PENDING_COURTESY_COOKIE = "pending_courtesy_key"

/**
 * Resgata automaticamente a cortesia guardada no cookie (setado por
 * /register?courtesy=CODE). Chamado no início do onboarding logo após o
 * primeiro login. Nunca lança — erros são silenciosos para não quebrar
 * o fluxo principal do onboarding.
 *
 * Marca redemptionSource como "QR_CODE" pois a chave veio via URL (o caminho
 * natural do QR do voucher).
 */
export async function autoRedeemCourtesyFromCookie(): Promise<
  | { redeemed: true; code: string; validUntil: Date }
  | { redeemed: false; reason?: string }
> {
  try {
    const session = await auth()
    if (!session?.user?.id) return { redeemed: false, reason: "no-session" }

    const cookieStore = await cookies()
    const rawCode = cookieStore.get(PENDING_COURTESY_COOKIE)?.value
    if (!rawCode) return { redeemed: false, reason: "no-cookie" }

    const code = normalizeKeyInput(rawCode)
    if (!isValidKeyFormat(code)) {
      cookieStore.delete(PENDING_COURTESY_COOKIE)
      return { redeemed: false, reason: "invalid-format" }
    }

    const userId = session.user.id

    // Se o usuário já tem assinatura Stripe real ativa, não aplica.
    const existingSub = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true, status: true },
    })
    const hasRealStripe =
      existingSub &&
      existingSub.stripeCustomerId &&
      !existingSub.stripeCustomerId.startsWith("courtesy_") &&
      existingSub.status === "active"
    if (hasRealStripe) {
      cookieStore.delete(PENDING_COURTESY_COOKIE)
      return { redeemed: false, reason: "has-stripe" }
    }

    const result = await prisma.$transaction(async (tx) => {
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
          redemptionSource: "QR_CODE",
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

    // Sucesso: limpa o cookie para não tentar resgatar de novo.
    cookieStore.delete(PENDING_COURTESY_COOKIE)
    return { redeemed: true, code, validUntil: result.validUntil }
  } catch (error) {
    const msg = error instanceof Error ? error.message : ""
    // Em qualquer erro, limpa o cookie para não ficar em loop e permite
    // o usuário tentar manualmente em "Ganhei uma Cortesia".
    try {
      const cookieStore = await cookies()
      cookieStore.delete(PENDING_COURTESY_COOKIE)
    } catch {}
    if (msg === "INVALID_OR_USED") return { redeemed: false, reason: "invalid-or-used" }
    console.error("[autoRedeemCourtesyFromCookie] Erro:", error)
    return { redeemed: false, reason: "error" }
  }
}
