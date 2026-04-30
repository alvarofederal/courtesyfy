"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

const schema = z.object({
  ticketId: z.string().min(1),
  body: z.string().min(1, "Mensagem vazia").max(5000),
})

/**
 * Adiciona uma mensagem à thread do chamado.
 * Admin pode responder qualquer chamado; usuário comum só o próprio.
 * Marca isAdmin a partir do role da sessão.
 * Quando admin responde em ticket OPEN, move para IN_PROGRESS automaticamente.
 */
export async function addTicketMessage(input: { ticketId: string; body: string }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }

  const rate = await checkRateLimit(`ticket-message:${session.user.id}`, 30, 10 * 60 * 1000)
  if (!rate.allowed) return { error: "Muitas mensagens. Aguarde alguns minutos." }

  const isAdmin = session.user.role === "ADMIN"

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: parsed.data.ticketId },
    select: { id: true, userId: true, status: true },
  })
  if (!ticket) return { error: "Chamado não encontrado" }
  if (!isAdmin && ticket.userId !== session.user.id) return { error: "Não autorizado" }
  if (ticket.status === "CLOSED") return { error: "Chamado fechado não aceita novas mensagens" }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.supportTicketMessage.create({
        data: {
          ticketId: ticket.id,
          authorId: session.user!.id!,
          body: parsed.data.body,
          isAdmin,
        },
      })

      // Transições automáticas de status
      if (isAdmin && ticket.status === "OPEN") {
        await tx.supportTicket.update({
          where: { id: ticket.id },
          data: { status: "IN_PROGRESS" },
        })
      } else if (!isAdmin && ticket.status === "WAITING_USER") {
        await tx.supportTicket.update({
          where: { id: ticket.id },
          data: { status: "IN_PROGRESS" },
        })
      }
    })

    revalidatePath("/dashboard/profile")
    revalidatePath("/dashboard/issues")
    revalidatePath(`/dashboard/issues/${ticket.id}`)
    return { success: true }
  } catch (error) {
    console.error("[addTicketMessage] Erro:", error)
    return { error: "Erro ao enviar mensagem. Tente novamente." }
  }
}
