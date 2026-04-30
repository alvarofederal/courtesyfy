import prisma from "@/lib/prisma"

/**
 * Busca o detalhe completo de um chamado pelo id.
 * Passe isAdmin=true para admin ver qualquer chamado; senão valida ownership.
 */
export async function getTicketDetail(id: string, viewerUserId: string, isAdmin: boolean) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          subscription: { select: { plan: true, status: true } },
        },
      },
      images: { orderBy: { order: "asc" } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  })

  if (!ticket) return null
  if (!isAdmin && ticket.userId !== viewerUserId) return null

  return ticket
}

export type TicketDetail = NonNullable<Awaited<ReturnType<typeof getTicketDetail>>>
