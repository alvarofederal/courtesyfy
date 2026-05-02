"use server"

import { z } from "zod"
import { db } from "@/lib/prisma"

const schema = z.object({
  codigo: z.string().min(1),
  nome: z.string().max(100).optional(),
  telefone: z.string().max(20).optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
})

export type AtivarChaveState = {
  success?: boolean
  error?: string
  fieldErrors?: Partial<Record<string, string[]>>
}

export async function ativarChave(
  _prev: AtivarChaveState,
  formData: FormData,
): Promise<AtivarChaveState> {
  const result = schema.safeParse({
    codigo: formData.get("codigo"),
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
    email: formData.get("email"),
  })

  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const { codigo, nome, telefone, email } = result.data

  if (!telefone && !email) {
    return { fieldErrors: { telefone: ["Informe telefone ou e-mail para ativar"] } }
  }

  const chave = await db.chave.findUnique({
    where: { codigo },
    select: { id: true, status: true, campanhaId: true, lojaId: true, expiraEm: false as never },
    // reselect with campanha expiraEm
  })

  // Re-fetch with campanha to check expiration
  const chaveCompleta = await db.chave.findUnique({
    where: { codigo },
    include: {
      campanha: { select: { expiraEm: true, status: true } },
    },
  })

  if (!chaveCompleta) {
    return { error: "Chave não encontrada" }
  }

  if (chaveCompleta.status === "RESGATADA") {
    return { error: "Esta chave já foi resgatada." }
  }

  if (chaveCompleta.status === "ATIVADA") {
    return { error: "Esta chave já está ativada. Apresente ao lojista para resgatar." }
  }

  if (chaveCompleta.status === "EXPIRADA" || chaveCompleta.status === "CANCELADA") {
    return { error: "Esta chave não é mais válida." }
  }

  if (
    chaveCompleta.campanha.status === "ENCERRADA" ||
    chaveCompleta.campanha.status === "CANCELADA"
  ) {
    return { error: "Esta campanha foi encerrada." }
  }

  if (new Date() > chaveCompleta.campanha.expiraEm) {
    await db.chave.update({ where: { id: chaveCompleta.id }, data: { status: "EXPIRADA" } })
    return { error: "Esta chave expirou." }
  }

  // Criar ou encontrar cliente
  let cliente = await db.cliente.findFirst({
    where: {
      OR: [
        ...(telefone ? [{ telefone }] : []),
        ...(email ? [{ email }] : []),
      ],
    },
  })

  if (!cliente) {
    cliente = await db.cliente.create({
      data: {
        nome: nome || null,
        telefone: telefone || null,
        email: email || null,
        canalOrigem: "WEB",
      },
    })
  } else if (nome && !cliente.nome) {
    await db.cliente.update({ where: { id: cliente.id }, data: { nome } })
  }

  await db.chave.update({
    where: { id: chaveCompleta.id },
    data: {
      status: "ATIVADA",
      clienteId: cliente.id,
      ativadaEm: new Date(),
    },
  })

  await db.logEvento.create({
    data: {
      tipoEvento: "CHAVE_ATIVADA",
      chaveId: chaveCompleta.id,
      campanhaId: chaveCompleta.campanhaId,
      lojaId: chaveCompleta.lojaId,
      clienteId: cliente.id,
      canal: "WEB",
    },
  })

  return { success: true }
}
