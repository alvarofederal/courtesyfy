"use server"

import { z } from "zod"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const schema = z.object({ id: z.string().cuid() })

export async function revealKey(input: { id: string }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Não autorizado" }
  }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: "Dados inválidos" }

  const key = await prisma.courtesyKey.findUnique({
    where: { id: parsed.data.id },
    select: { code: true, printedAt: true },
  })

  if (!key) return { error: "Chave não encontrada" }
  if (key.printedAt) return { error: "Chave já impressa — código não pode mais ser revelado" }

  return { success: true, code: key.code }
}
