// src/app/(panel)/dashboard/profile/_data_access/get-info-use.ts
import prisma from "@/lib/prisma"

interface GetUserDataProps {
  userId: string
}

export async function getUserData({ userId }: GetUserDataProps) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      times: true,
      addresses: true,
      // 🔥 NOVO: Incluir tipos de atendimento
      userTypeServices: {
        where: { active: true },
        select: {
          typeServiceId: true,
          typeService: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        }
      }
    }
  })

  return user
}

// 🔥 NOVO: Buscar todos os tipos disponíveis
export async function getAllTypeServices() {
  return await prisma.typeService.findMany({
    where: { status: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true
    }
  })
}