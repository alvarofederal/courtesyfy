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
  console.log("[criarCampanha] INÍCIO")

  // 1. Autenticação
  const session = await auth()
  console.log("[criarCampanha] session.user.id:", session?.user?.id)
  console.log("[criarCampanha] session.user.lojaId:", session?.user?.lojaId)

  if (!session?.user?.lojaId) {
    console.log("[criarCampanha] BLOQUEADO: sem lojaId")
    return { error: "Não autorizado" }
  }

  // 2. Log dos dados recebidos
  const rawData = {
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
  }
  console.log("[criarCampanha] formData:", JSON.stringify(rawData))

  // 3. Validação
  const result = schema.safeParse(rawData)

  if (!result.success) {
    const erros = result.error.flatten()
    console.log("[criarCampanha] FALHA VALIDAÇÃO:", JSON.stringify(erros))
    return { fieldErrors: erros.fieldErrors as Record<string, string[]> }
  }

  console.log("[criarCampanha] validação OK:", JSON.stringify(result.data))

  const data = result.data
  const inicio = new Date(data.inicioEm)
  const expira = new Date(data.expiraEm)

  // 4. Validação de datas
  if (expira <= inicio) {
    console.log("[criarCampanha] FALHA: expiração antes do início")
    return { fieldErrors: { expiraEm: ["A expiração deve ser posterior à data de início"] } }
  }

  // 5. Verificar limite do plano
  const loja = await db.loja.findUnique({
    where: { id: session.user.lojaId },
    select: { plano: true },
  })
  console.log("[criarCampanha] loja.plano:", loja?.plano)

  if (loja?.plano === "ESSENCIAL") {
    const total = await db.campanha.count({
      where: { lojaId: session.user.lojaId!, status: { not: "CANCELADA" } },
    })
    console.log("[criarCampanha] total campanhas ESSENCIAL:", total)
    if (total >= 3) {
      return {
        error: "Plano Essencial permite no máximo 3 campanhas ativas. Faça upgrade para criar mais.",
      }
    }
  }

  // 6. Criar campanha
  const insertData = {
    lojaId: session.user.lojaId!,
    criadoPorId: session.user.id ?? null,
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
    status: data.publicar === "ativa" ? ("ATIVA" as const) : ("RASCUNHO" as const),
  }
  console.log("[criarCampanha] tentando criar:", JSON.stringify({ ...insertData, inicioEm: inicio.toISOString(), expiraEm: expira.toISOString() }))

  let campanhaId: string
  try {
    const campanha = await db.campanha.create({
      data: insertData,
      select: { id: true },
    })
    campanhaId = campanha.id
    console.log("[criarCampanha] SUCESSO criada id:", campanhaId)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[criarCampanha] ERRO DB:", msg)
    return { error: `Erro ao salvar campanha: ${msg}` }
  }

  revalidatePath("/dashboard/campanhas")
  redirect(`/dashboard/campanhas/${campanhaId}`)
}
