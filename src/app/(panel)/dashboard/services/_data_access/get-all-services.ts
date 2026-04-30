// src/app/(panel)/dashboard/services/_data_access/get-all-services.ts

import prisma from "@/lib/prisma"

interface GetAllTypeServicesProps {
  userId: string  // Mantém para compatibilidade, mas não usa no filtro
}

export async function getAllTypeServices({ userId }: GetAllTypeServicesProps) {
  try {
    // 🔥 BUSCA TODOS OS TIPOS DO SISTEMA (não filtra por userId)
    const typeServices = await prisma.typeService.findMany({
      where: {
        status: true  // Apenas tipos ativos
      },
      orderBy: {
        name: 'asc'  // Ordem alfabética
      }
    })

    console.log(`✅ [getAllTypeServices] ${typeServices.length} tipos encontrados no sistema`)

    return {
      data: typeServices,
      error: null
    }

  } catch (error) {
    console.error("❌ Erro ao buscar tipos de atendimento:", error)
    
    return {
      data: [],
      error: "Erro ao buscar tipos de atendimento"
    }
  }
}