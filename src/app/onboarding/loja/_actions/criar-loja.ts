"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"

const criarLojaSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  cnpjCpf: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, "Selecione um estado").optional().or(z.literal("")),
})

export async function criarLoja(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Não autorizado" }
  if (session.user.lojaId) return { error: "Você já possui uma loja" }

  const raw = {
    nome: formData.get("nome") as string,
    email: formData.get("email") as string,
    telefone: formData.get("telefone") as string || undefined,
    cnpjCpf: formData.get("cnpjCpf") as string || undefined,
    cidade: formData.get("cidade") as string || undefined,
    estado: formData.get("estado") as string || undefined,
  }

  const parsed = criarLojaSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { nome, email, telefone, cnpjCpf, cidade, estado } = parsed.data

  const emailExiste = await db.loja.findUnique({ where: { email } })
  if (emailExiste) return { error: "Já existe uma loja com este email" }

  if (cnpjCpf) {
    const cnpjExiste = await db.loja.findUnique({ where: { cnpjCpf } })
    if (cnpjExiste) return { error: "CNPJ/CPF já cadastrado" }
  }

  const loja = await db.loja.create({
    data: {
      nome,
      email,
      telefone: telefone || null,
      cnpjCpf: cnpjCpf || null,
      cidade: cidade || null,
      estado: estado || null,
    },
  })

  await db.user.update({
    where: { id: session.user.id },
    data: {
      lojaId: loja.id,
      role: "LOJISTA",
    },
  })

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
