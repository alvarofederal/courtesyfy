import prisma from "@/lib/prisma"

export async function getUserCourtesy(userId: string) {
  const key = await prisma.courtesyKey.findUnique({
    where: { redeemedByUserId: userId },
    select: {
      code: true,
      validUntil: true,
      redeemedAt: true,
      redemptionSource: true,
    },
  })

  if (!key) return null

  const now = new Date()
  const isActive = key.validUntil > now
  const daysRemaining = Math.max(
    0,
    Math.ceil((key.validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  )

  return {
    code: key.code,
    expiresAt: key.validUntil,
    redeemedAt: key.redeemedAt,
    redemptionSource: key.redemptionSource,
    isActive,
    daysRemaining,
  }
}

export type UserCourtesy = Awaited<ReturnType<typeof getUserCourtesy>>
