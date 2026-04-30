"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

const schema = z.object({
  name: z.string().min(2, "Nome muito curto").max(120),
})

export async function updateAdminProfile(data: { name: string }) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Não autorizado" }
  if (session.user.role !== "ADMIN") return { error: "Apenas administradores" }

  const parsed = schema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
  })

  revalidatePath("/dashboard/profile")
  return { success: true }
}
