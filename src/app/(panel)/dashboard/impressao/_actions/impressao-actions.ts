"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

// ─────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────

export type SolicitacaoState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
}

const criarSchema = z.object({
  campanhaId:      z.string().min(1, "Selecione uma campanha"),
  loteId:          z.string().min(1, "Selecione um lote"),
  layoutId:        z.string().min(1, "Selecione um layout"),
  quantidadeCards: z.coerce.number().int().min(1, "Mínimo 1 card").max(10000),
  folhasEstimadas: z.coerce.number().int().min(1),
  observacaoLoja:  z.string().max(500).optional(),
})

// ─────────────────────────────────────────
// LOJISTA: CRIAR SOLICITAÇÃO
// ─────────────────────────────────────────

export async function criarSolicitacao(
  _prev: SolicitacaoState,
  formData: FormData,
): Promise<SolicitacaoState> {
  const session = await auth()
  if (!session?.user?.lojaId) return { error: "Não autorizado" }

  const result = criarSchema.safeParse({
    campanhaId:      formData.get("campanhaId"),
    loteId:          formData.get("loteId"),
    layoutId:        formData.get("layoutId"),
    quantidadeCards: formData.get("quantidadeCards"),
    folhasEstimadas: formData.get("folhasEstimadas"),
    observacaoLoja:  formData.get("observacaoLoja") || undefined,
  })

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const d = result.data

  // Verificar que campanha, lote e layout pertencem à loja
  const [campanha, lote, layout] = await Promise.all([
    db.campanha.findFirst({ where: { id: d.campanhaId, lojaId: session.user.lojaId } }),
    db.loteChave.findFirst({ where: { id: d.loteId,    lojaId: session.user.lojaId } }),
    db.layout.findFirst({   where: { id: d.layoutId,   lojaId: session.user.lojaId } }),
  ])

  if (!campanha) return { error: "Campanha não encontrada" }
  if (!lote)     return { error: "Lote não encontrado" }
  if (!layout)   return { error: "Layout não encontrado" }

  await db.solicitacaoImpressao.create({
    data: {
      lojaId:          session.user.lojaId,
      campanhaId:      d.campanhaId,
      loteId:          d.loteId,
      layoutId:        d.layoutId,
      quantidadeCards: d.quantidadeCards,
      folhasEstimadas: d.folhasEstimadas,
      observacaoLoja:  d.observacaoLoja || null,
      status:          "PENDENTE",
    },
  })

  revalidatePath("/dashboard/impressao")
  redirect("/dashboard/impressao")
}

// ─────────────────────────────────────────
// LOJISTA: CANCELAR SOLICITAÇÃO
// ─────────────────────────────────────────

export async function cancelarSolicitacao(id: string): Promise<{ error?: string }> {
  const session = await auth()
  if (!session?.user?.lojaId) return { error: "Não autorizado" }

  const sol = await db.solicitacaoImpressao.findFirst({
    where: { id, lojaId: session.user.lojaId },
  })

  if (!sol) return { error: "Solicitação não encontrada" }
  if (!["PENDENTE", "EM_ANALISE"].includes(sol.status)) {
    return { error: "Não é possível cancelar uma solicitação já processada" }
  }

  await db.solicitacaoImpressao.delete({ where: { id } })

  revalidatePath("/dashboard/impressao")
  return {}
}

// ─────────────────────────────────────────
// ADMIN: ATUALIZAR STATUS
// ─────────────────────────────────────────

export type AdminAtualizarState = {
  error?: string
  success?: boolean
}

export async function adminAtualizarSolicitacao(
  _prev: AdminAtualizarState,
  formData: FormData,
): Promise<AdminAtualizarState> {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") return { error: "Não autorizado" }

  const id     = formData.get("id") as string
  const status = formData.get("status") as string
  const obs    = (formData.get("observacaoAdmin") as string) || null

  const validStatus = ["PENDENTE", "EM_ANALISE", "APROVADA", "REJEITADA", "IMPRESSA", "ENTREGUE"]
  if (!validStatus.includes(status)) return { error: "Status inválido" }

  const sol = await db.solicitacaoImpressao.findUnique({ where: { id } })
  if (!sol) return { error: "Solicitação não encontrada" }

  const isAprovando = status === "APROVADA" && sol.status !== "APROVADA"

  await db.solicitacaoImpressao.update({
    where: { id },
    data: {
      status:          status as "PENDENTE" | "EM_ANALISE" | "APROVADA" | "REJEITADA" | "IMPRESSA" | "ENTREGUE",
      observacaoAdmin: obs,
      aprovadoPorId:   isAprovando ? session.user.id : undefined,
      aprovadoEm:      isAprovando ? new Date() : undefined,
    },
  })

  revalidatePath("/dashboard/admin/impressoes")
  revalidatePath(`/dashboard/admin/impressoes/${id}`)
  return { success: true }
}
