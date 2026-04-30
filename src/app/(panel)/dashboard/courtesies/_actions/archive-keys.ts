"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const schema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
})

/**
 * Arquiva chaves de cortesia. Arquivar é apenas um flag visual de
 * organização: não impede resgate, preview ou qualquer outra operação.
 * Serve para "esconder" da listagem principal chaves já processadas
 * (impressas/resgatadas/expiradas) e manter só as que ainda vão ser
 * impressas.
 */
export async function archiveKeys(input: { ids: string[] }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }
  if (session.user.role !== "ADMIN") return { error: "Apenas administradores" }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: "IDs inválidos" }

  const result = await prisma.courtesyKey.updateMany({
    where: { id: { in: parsed.data.ids }, archivedAt: null },
    data: { archivedAt: new Date() },
  })

  revalidatePath("/dashboard/courtesies")
  return { success: true, count: result.count }
}

export async function unarchiveKeys(input: { ids: string[] }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }
  if (session.user.role !== "ADMIN") return { error: "Apenas administradores" }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: "IDs inválidos" }

  const result = await prisma.courtesyKey.updateMany({
    where: { id: { in: parsed.data.ids }, archivedAt: { not: null } },
    data: { archivedAt: null },
  })

  revalidatePath("/dashboard/courtesies")
  return { success: true, count: result.count }
}
