"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type LayoutState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
}

export async function criarLayout(_prev: LayoutState, formData: FormData): Promise<LayoutState> {
  const session = await auth()
  if (!session?.user?.lojaId) return { error: "Não autorizado" }

  const nome          = formData.get("nome") as string
  const corPrimaria   = formData.get("corPrimaria") as string
  const imagem1Url    = (formData.get("imagem1Url") as string) || null
  const imagem2Url    = (formData.get("imagem2Url") as string) || null
  const imagem3Url    = (formData.get("imagem3Url") as string) || null
  const opacidadeFundo = parseInt(formData.get("opacidadeFundo") as string) || 20
  const padrao        = formData.get("padrao") === "on"

  if (!nome?.trim()) return { fieldErrors: { nome: ["Nome obrigatório"] } }

  if (padrao) {
    await db.layout.updateMany({
      where: { lojaId: session.user.lojaId, padrao: true },
      data: { padrao: false },
    })
  }

  await db.layout.create({
    data: {
      lojaId: session.user.lojaId,
      nome: nome.trim(),
      corPrimaria: corPrimaria || "#c8a96e",
      imagem1Url,
      imagem2Url,
      imagem3Url,
      opacidadeFundo: Math.min(60, Math.max(5, opacidadeFundo)),
      padrao,
    },
  })

  revalidatePath("/dashboard/layout")
  redirect("/dashboard/layout")
}

export async function atualizarLayout(_prev: LayoutState, formData: FormData): Promise<LayoutState> {
  const session = await auth()
  if (!session?.user?.lojaId) return { error: "Não autorizado" }

  const id            = formData.get("id") as string
  const nome          = formData.get("nome") as string
  const corPrimaria   = formData.get("corPrimaria") as string
  const imagem1Url    = (formData.get("imagem1Url") as string) || null
  const imagem2Url    = (formData.get("imagem2Url") as string) || null
  const imagem3Url    = (formData.get("imagem3Url") as string) || null
  const opacidadeFundo = parseInt(formData.get("opacidadeFundo") as string) || 20
  const padrao        = formData.get("padrao") === "on"

  if (!nome?.trim()) return { fieldErrors: { nome: ["Nome obrigatório"] } }

  const layout = await db.layout.findUnique({ where: { id } })
  if (!layout || layout.lojaId !== session.user.lojaId) return { error: "Não encontrado" }

  if (padrao) {
    await db.layout.updateMany({
      where: { lojaId: session.user.lojaId, padrao: true, id: { not: id } },
      data: { padrao: false },
    })
  }

  await db.layout.update({
    where: { id },
    data: {
      nome: nome.trim(),
      corPrimaria: corPrimaria || "#c8a96e",
      imagem1Url,
      imagem2Url,
      imagem3Url,
      opacidadeFundo: Math.min(60, Math.max(5, opacidadeFundo)),
      padrao,
    },
  })

  revalidatePath("/dashboard/layout")
  return { success: true }
}

export async function excluirLayout(id: string) {
  const session = await auth()
  if (!session?.user?.lojaId) return

  const layout = await db.layout.findUnique({ where: { id }, select: { lojaId: true } })
  if (!layout || layout.lojaId !== session.user.lojaId) return

  await db.layout.delete({ where: { id } })
  revalidatePath("/dashboard/layout")
}
