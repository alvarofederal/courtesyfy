"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { checkRateLimit } from "@/lib/rate-limit"

const CATEGORIES = [
  "ACCESS_LOGIN",
  "ACCESS_PERMISSION",
  "SCHEDULING_CREATE",
  "SCHEDULING_EDIT",
  "SCHEDULING_VIEW",
  "SCHEDULING_NOTIFICATION",
  "OTHER",
] as const

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const

const imageSchema = z.object({
  url: z.string().url().max(500),
  publicId: z.string().max(200).optional().nullable(),
})

const schema = z.object({
  title: z.string().min(3, "Título muito curto").max(120, "Título muito longo"),
  description: z.string().min(20, "Descreva com pelo menos 20 caracteres").max(5000),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES).default("NORMAL"),
  metadata: z.record(z.unknown()).optional(),
  images: z.array(imageSchema).max(2, "Máximo de 2 imagens").optional().default([]),
})

export type CreateTicketInput = z.infer<typeof schema>

/**
 * Cria um novo chamado para o usuário logado.
 * Metadata combina contexto técnico (user-agent, URL) com campos contextuais da categoria.
 */
export async function createTicket(input: CreateTicketInput) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const rate = await checkRateLimit(`ticket-create:${session.user.id}`, 10, 60 * 60 * 1000)
  if (!rate.allowed) {
    return { error: "Muitos chamados criados. Tente novamente em 1 hora." }
  }

  try {
    const { title, description, category, priority, metadata, images } = parsed.data

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session.user.id,
        title,
        description,
        category,
        priority,
        status: "OPEN",
        metadata: metadata as never,
        images: images && images.length > 0 ? {
          create: images.map((img, idx) => ({
            url: img.url,
            publicId: img.publicId ?? null,
            order: idx,
          })),
        } : undefined,
      },
      select: { id: true },
    })

    revalidatePath("/dashboard/profile")
    revalidatePath("/dashboard/issues")
    return { success: true, id: ticket.id }
  } catch (error) {
    console.error("[createTicket] Erro:", error)
    return { error: "Erro ao abrir chamado. Tente novamente." }
  }
}
