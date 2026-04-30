"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

const schema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(500),
})

export async function markKeysAsPrinted(input: { ids: string[] }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Não autorizado" }
  }

  const parsed = schema.safeParse(input)
  if (!parsed.success) return { error: "Dados inválidos" }

  const result = await prisma.courtesyKey.updateMany({
    where: {
      id: { in: parsed.data.ids },
      printedAt: null,
    },
    data: { printedAt: new Date() },
  })

  revalidatePath("/dashboard/courtesies")
  return { success: true, count: result.count }
}
