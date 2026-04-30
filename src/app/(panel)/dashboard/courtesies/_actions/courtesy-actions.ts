"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const requestCourtesySchema = z.object({
  message: z.string().min(20, "Descreva em pelo menos 20 caracteres").max(500),
})

/**
 * Registra uma solicitação do usuário interessado em obter cortesia.
 * Não concede automaticamente — um admin precisa aprovar via /dashboard/courtesies.
 */
export async function activateCourtesy(input: { message: string }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }

  const parsed = requestCourtesySchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const existing = await prisma.courtesyKey.findUnique({
    where: { redeemedByUserId: session.user.id },
    select: { validUntil: true }
  })

  if (existing && existing.validUntil > new Date()) {
    return { error: "Você já possui cortesia ativa" }
  }

  return {
    success: true,
    message: "Pedido registrado. Nossa equipe entrará em contato em breve.",
  }
}
