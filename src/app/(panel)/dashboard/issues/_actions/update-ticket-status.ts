"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_USER", "RESOLVED", "CLOSED"] as const
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const

const schema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(STATUSES).optional(),
  priority: z.enum(PRIORITIES).optional(),
})

/**
 * Admin-only: muda status e/ou prioridade de um chamado.
 * Quando marca como RESOLVED ou CLOSED, seta closedAt.
 */
export async function updateTicketStatus(input: {
  ticketId: string
  status?: typeof STATUSES[number]
  priority?: typeof PRIORITIES[number]
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }
  if (session.user.role !== "ADMIN") return { error: "Apenas administradores" }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: "Dados inválidos" }

  if (!parsed.data.status && !parsed.data.priority) {
    return { error: "Informe status ou prioridade" }
  }

  try {
    const data: Record<string, unknown> = {}
    if (parsed.data.status) {
      data.status = parsed.data.status
      if (parsed.data.status === "RESOLVED" || parsed.data.status === "CLOSED") {
        data.closedAt = new Date()
      } else {
        data.closedAt = null
      }
    }
    if (parsed.data.priority) data.priority = parsed.data.priority

    await prisma.supportTicket.update({
      where: { id: parsed.data.ticketId },
      data,
    })

    revalidatePath("/dashboard/issues")
    revalidatePath(`/dashboard/issues/${parsed.data.ticketId}`)
    return { success: true }
  } catch (error) {
    console.error("[updateTicketStatus] Erro:", error)
    return { error: "Erro ao atualizar chamado." }
  }
}
