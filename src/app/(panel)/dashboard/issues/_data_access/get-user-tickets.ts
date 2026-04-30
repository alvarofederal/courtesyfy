import prisma from "@/lib/prisma"

/**
 * Lista os chamados do usuário logado, mais recentes primeiro.
 * Usado no modal de Chamados (aba "Meus Chamados").
 */
export async function getUserTickets(userId: string) {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      category: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      closedAt: true,
      images: {
        orderBy: { order: "asc" },
        select: { id: true, url: true, order: true },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          isAdmin: true,
          createdAt: true,
          authorId: true,
        },
      },
    },
  })

  return tickets
}

export type UserTicket = Awaited<ReturnType<typeof getUserTickets>>[number]
