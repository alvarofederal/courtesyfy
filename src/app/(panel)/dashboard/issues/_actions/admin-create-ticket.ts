"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

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
  targetUserId: z.string().min(1, "Usuário é obrigatório"),
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(5000),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES).default("NORMAL"),
  metadata: z.record(z.unknown()).optional(),
  images: z.array(imageSchema).max(2).optional().default([]),
})

export type AdminCreateTicketInput = z.infer<typeof schema>

/**
 * Admin cria um chamado em nome de outro usuário (por telefone, presencialmente, etc.)
 * Registra no metadata.createdByAdmin pra rastreabilidade.
 */
export async function adminCreateTicket(input: AdminCreateTicketInput) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }
  if (session.user.role !== "ADMIN") return { error: "Apenas administradores" }

  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { targetUserId, title, description, category, priority, metadata, images } = parsed.data

  // Valida que o usuário existe
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, email: true },
  })
  if (!target) return { error: "Usuário não encontrado" }

  try {
    const mergedMetadata = {
      ...(metadata ?? {}),
      createdByAdmin: {
        adminId: session.user.id,
        adminEmail: session.user.email,
        createdAt: new Date().toISOString(),
      },
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: targetUserId,
        title,
        description,
        category,
        priority,
        status: "IN_PROGRESS", // já entra em análise pois admin está tratando
        metadata: mergedMetadata as never,
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

    revalidatePath("/dashboard/issues")
    return { success: true, id: ticket.id }
  } catch (error) {
    console.error("[adminCreateTicket] Erro:", error)
    return { error: "Erro ao criar chamado." }
  }
}

/**
 * Busca usuários para o admin associar a um chamado.
 * Filtro por nome/email/cpf (match parcial).
 */
export async function searchUsersForTicket(query: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado", users: [] }
  if (session.user.role !== "ADMIN") return { error: "Apenas administradores", users: [] }

  const q = query.trim()
  if (q.length < 2) return { users: [] }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { cpf: { contains: q } },
      ],
    },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      subscription: { select: { plan: true } },
    },
    orderBy: { name: "asc" },
  })

  return { users }
}
