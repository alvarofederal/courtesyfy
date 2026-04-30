"use server"

import { randomUUID } from "crypto"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { generateCourtesyKey } from "@/utils/courtesy/generate-key"

const schema = z.object({
  quantity: z.number().int().min(1).max(500),
  validUntil: z.string().min(10),
})

export async function generateKeys(input: { quantity: number; validUntil: string }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Não autorizado" }
  }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: "Dados inválidos" }

  const validUntil = new Date(parsed.data.validUntil)
  if (Number.isNaN(validUntil.getTime()) || validUntil <= new Date()) {
    return { error: "Data de validade inválida" }
  }

  const batchId = randomUUID()
  const codes = new Set<string>()
  let attempts = 0
  while (codes.size < parsed.data.quantity && attempts < parsed.data.quantity * 5) {
    codes.add(generateCourtesyKey())
    attempts++
  }

  if (codes.size < parsed.data.quantity) {
    return { error: "Falha ao gerar chaves únicas. Tente novamente." }
  }

  await prisma.courtesyKey.createMany({
    data: Array.from(codes).map((code) => ({
      code,
      validUntil,
      batchId,
      createdByAdminId: session.user.id!,
    })),
  })

  revalidatePath("/dashboard/courtesies")
  return { success: true, batchId, quantity: codes.size }
}
