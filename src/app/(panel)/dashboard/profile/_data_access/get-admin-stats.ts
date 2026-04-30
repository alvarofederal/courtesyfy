import prisma from "@/lib/prisma"

export async function getAdminStats() {
  const [totalUsers, openTickets, activeCourtesies, activeSubscriptions] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.supportTicket.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_USER"] } },
    }),
    prisma.courtesyKey.count({
      where: { redeemedAt: { not: null }, archivedAt: null, validUntil: { gt: new Date() } },
    }),
    prisma.subscription.count({ where: { status: "active" } }),
  ])

  return { totalUsers, openTickets, activeCourtesies, activeSubscriptions }
}
