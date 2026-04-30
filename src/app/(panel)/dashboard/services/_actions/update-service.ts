// src/app/(panel)/dashboard/services/_actions/update-service.ts

"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

interface UpdateTypeServiceProps {
  typeServiceId: string
  name: string
  description?: string | null
  duration: number
}

export async function updateTypeService({ 
  typeServiceId, 
  name, 
  description,
  duration 
}: UpdateTypeServiceProps) {
  try {
    // Validação: Usuário autenticado
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Não autorizado" }
    }

    // Validar: Tipo existe?
    const existingType = await prisma.typeService.findUnique({
      where: { id: typeServiceId }
    })

    if (!existingType) {
      return { error: "Tipo de atendimento não encontrado" }
    }

    // Validar: Nome não pode estar vazio
    if (!name || name.trim().length === 0) {
      return { error: "O nome do tipo de atendimento é obrigatório" }
    }

    // Validar: Duração deve ser maior que zero
    if (duration <= 0) {
      return { error: "A duração deve ser maior que zero" }
    }

    // Atualizar tipo
    await prisma.typeService.update({
      where: {
        id: typeServiceId
      },
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        duration: duration
      }
    })

    console.log(`✅ [updateTypeService] Tipo atualizado: ${name} (ID: ${typeServiceId})`)

    revalidatePath("/dashboard/services")
    revalidatePath("/dashboard/profile")

    return {
      success: true,
      data: "Tipo de atendimento atualizado com sucesso"
    }

  } catch (error) {
    console.error("❌ Erro ao atualizar tipo de atendimento:", error)
    return { error: "Erro ao atualizar tipo de atendimento" }
  }
}