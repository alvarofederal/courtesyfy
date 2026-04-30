// src/app/(panel)/dashboard/services/_actions/delete-service.ts

"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

interface DeleteTypeServiceProps {
  typeServiceId: string
}

export async function deleteTypeService({ typeServiceId }: DeleteTypeServiceProps) {
  try {
    // 🔥 VALIDAÇÃO: Somente admin pode deletar
    const session = await auth()
    
    if (!session?.user?.id) {
      return { error: "Não autorizado" }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return { error: "Apenas administradores podem deletar tipos de atendimento" }
    }

    // 🔥 VALIDAR: Tipo existe?
    const existingType = await prisma.typeService.findUnique({
      where: { id: typeServiceId }
    })

    if (!existingType) {
      return { error: "Tipo de atendimento não encontrado" }
    }

    // 🔥 VALIDAÇÃO CRÍTICA: Verificar se tipo está sendo usado por algum profissional
    const usageCount = await prisma.userTypeService.count({
      where: {
        typeServiceId: typeServiceId,
        active: true
      }
    })

    if (usageCount > 0) {
      console.warn(`⚠️ [deleteTypeService] Tentativa de deletar tipo em uso:`, {
        typeServiceId,
        typeName: existingType.name,
        usedByProfessionals: usageCount
      })

      return {
        error: `Este tipo de atendimento está sendo usado por ${usageCount} profissional(is). Não é possível removê-lo. Desative primeiro o tipo no perfil desses profissionais.`
      }
    }

    // 🔥 VALIDAÇÃO: Verificar se tipo tem agendamentos
    const appointmentsCount = await prisma.appointment.count({
      where: {
        typeServiceId: typeServiceId
      }
    })

    if (appointmentsCount > 0) {
      console.warn(`⚠️ [deleteTypeService] Tentativa de deletar tipo com agendamentos:`, {
        typeServiceId,
        typeName: existingType.name,
        appointmentsCount
      })

      return {
        error: `Este tipo de atendimento possui ${appointmentsCount} agendamento(s) registrado(s). Não é possível removê-lo.`
      }
    }

    // 🔥 DELETAR TIPO GLOBAL (sem filtro de userId)
    await prisma.typeService.delete({
      where: {
        id: typeServiceId
        // 🔥 NÃO filtra por userId - tipos são globais!
      }
    })

    console.log(`✅ [deleteTypeService] Tipo deletado: ${existingType.name} (ID: ${typeServiceId})`)

    revalidatePath("/dashboard/services")
    revalidatePath("/dashboard/profile")

    return {
      success: true,
      data: "Tipo de atendimento deletado com sucesso"
    }

  } catch (error) {
    console.error("❌ Erro ao deletar tipo de atendimento:", error)
    return { error: "Erro ao deletar tipo de atendimento" }
  }
}