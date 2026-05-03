"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"

const schema = z.object({
  nome: z.string().min(3, "Mínimo 3 caracteres").max(100, "Máximo 100 caracteres"),
  descricao: z.string().max(500).optional(),
  tipoBeneficio: z.enum([
    "DESCONTO_PERCENTUAL",
    "DESCONTO_FIXO",
    "BRINDE",
    "SORTEIO",
    "FRETE_GRATIS",
    "CASHBACK",
  ]),
  valorBeneficio: z.string().optional(),
  descricaoPremio: z.string().max(300).optional(),
  regrasUso: z.string().max(1000).optional(),
  inicioEm: z.string().min(1, "Data de início obrigatória"),
  expiraEm: z.string().min(1, "Data de expiração obrigatória"),
  quantidadeChaves: z.coerce
    .number()
    .int()
    .min(1, "Mínimo 1 chave")
    .max(10000, "Máximo 10.000 chaves por campanha"),
  publicar: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? "rascunho")
    .pipe(z.enum(["rascunho", "ativa"])),
})

export type CampanhaFormState = {
  error?: string
  fieldErrors?: Partial<Record<string, string[]>>
}

export async function criarCampanha(
  _prev: CampanhaFormState,
  formData: FormData,
): Promise<CampanhaFormState> {
  const session = await auth()
  if (!session?.user?.lojaId) return { error: "Não autorizado" }

  const result = schema.safeParse({
    nome: formData.get("nome"),
    descricao: formData.get("descricao"),
    tipoBeneficio: formData.get("tipoBeneficio"),
    valorBeneficio: formData.get("valorBeneficio"),
    descricaoPremio: formData.get("descricaoPremio"),
    regrasUso: formData.get("regrasUso"),
    inicioEm: formData.get("inicioEm"),
    expiraEm: formData.get("expiraEm"),
    quantidadeChaves: formData.get("quantidadeChaves"),
    publicar: formData.get("publicar"),
  })

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const data = result.data
  const inicio = new Date(data.inicioEm)
  const expira = new Date(data.expiraEm)

  if (expira <= inicio) {
    return { fieldErrors: { expiraEm: ["A expiração deve ser posterior à data de início"] } }
  }

  const loja = await db.loja.findUnique({
    where: { id: session.user.lojaId },
    select: { plano: true },
  })

  if (loja?.plano === "ESSENCIAL") {
    const total = await db.campanha.count({
      where: { lojaId: session.user.lojaId!, status: { not: "CANCELADA" } },
    })
    if (total >= 3) {
      return {
        error:
          "Plano Essencial permite no máximo 3 campanhas ativas. Faça upgrade para criar mais.",
      }
    }
  }

  let campanha: { id: string }
  try {
    campanha = await db.campanha.create({
      data: {
        lojaId: session.user.lojaId!,
        criadoPorId: session.user.id,
        nome: data.nome,
        descricao: data.descricao || null,
        tipoBeneficio: data.tipoBeneficio,
        valorBeneficio:
          data.valorBeneficio && data.valorBeneficio.trim() !== ""
            ? parseFloat(data.valorBeneficio)
            : null,
        descricaoPremio: data.descricaoPremio || null,
        regrasUso: data.regrasUso || null,
        inicioEm: inicio,
        expiraEm: expira,
        quantidadeChaves: data.quantidadeChaves,
        status: data.publicar === "ativa" ? "ATIVA" : "RASCUNHO",
      },
      select: { id: true },
    })
  } catch (e) {
    console.error("[criarCampanha]", e)
    return { error: "Erro ao salvar campanha. Tente novamente." }
  }

  revalidatePath("/dashboard/campanhas")
  redirect(`/dashboard/campanhas/${campanha.id}`)
}
