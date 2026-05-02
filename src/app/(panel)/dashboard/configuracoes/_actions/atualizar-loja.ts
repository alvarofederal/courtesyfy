"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"

const schema = z.object({
  nome: z.string().min(2, "Mínimo 2 caracteres").max(100),
  nomeExibicao: z.string().max(100).optional(),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().max(20).optional(),
  cnpjCpf: z.string().max(18).optional(),
  logradouro: z.string().max(200).optional(),
  numero: z.string().max(10).optional(),
  complemento: z.string().max(100).optional(),
  bairro: z.string().max(100).optional(),
  cidade: z.string().max(100).optional(),
  estado: z.string().length(2).optional().or(z.literal("")),
  cep: z.string().max(9).optional(),
  siteUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  logoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  corPrimaria: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida (use HEX, ex: #10b981)")
    .default("#10b981"),
})

export type ConfiguracaoLojaState = {
  success?: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string[]>>
}

export async function atualizarLoja(
  _prev: ConfiguracaoLojaState,
  formData: FormData,
): Promise<ConfiguracaoLojaState> {
  const session = await auth()
  if (!session?.user?.lojaId) return { error: "Não autorizado" }

  const result = schema.safeParse({
    nome:         formData.get("nome"),
    nomeExibicao: formData.get("nomeExibicao"),
    email:        formData.get("email"),
    telefone:     formData.get("telefone"),
    cnpjCpf:      formData.get("cnpjCpf"),
    logradouro:   formData.get("logradouro"),
    numero:       formData.get("numero"),
    complemento:  formData.get("complemento"),
    bairro:       formData.get("bairro"),
    cidade:       formData.get("cidade"),
    estado:       formData.get("estado"),
    cep:          formData.get("cep"),
    siteUrl:      formData.get("siteUrl"),
    logoUrl:      formData.get("logoUrl"),
    corPrimaria:  formData.get("corPrimaria"),
  })

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const d = result.data

  await db.loja.update({
    where: { id: session.user.lojaId! },
    data: {
      nome:         d.nome,
      nomeExibicao: d.nomeExibicao || null,
      email:        d.email,
      telefone:     d.telefone || null,
      cnpjCpf:      d.cnpjCpf || null,
      logradouro:   d.logradouro || null,
      numero:       d.numero || null,
      complemento:  d.complemento || null,
      bairro:       d.bairro || null,
      cidade:       d.cidade || null,
      estado:       (d.estado || null) as string | null,
      cep:          d.cep || null,
      siteUrl:      d.siteUrl || null,
      logoUrl:      d.logoUrl || null,
      corPrimaria:  d.corPrimaria,
    },
  })

  revalidatePath("/dashboard/configuracoes")
  revalidatePath("/dashboard")
  return { success: true }
}
