// src/app/(public)/profissional/[id]/_data_access/get-info-schedule.ts
import prisma from "@/lib/prisma";

export async function getInfoSchedule({ idOrSlug }: { idOrSlug: string }) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { urlNameProfessional: idOrSlug }
      ]
    },
    include: {
      // ✅ Endereços do profissional
      addresses: {
        orderBy: { createdAt: 'asc' }
      },
      
      // ✅ Assinatura/plano
      subscription: true,
      
      // ✅ Tipos de atendimento (serviços)
      userTypeServices: {
        where: { active: true },
        include: {
          typeService: {
            select: {
              id: true,
              name: true,
              description: true,
              duration: true,
              status: true
            }
          }
        },
        orderBy: {
          typeService: {
            name: 'asc'
          }
        }
      },

      // ✅ Horários disponíveis
      times: {
        orderBy: { time: 'asc' }
      },

      // ✅ Profissão
      profession: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!user) return null;

  // ✅ Retorna o usuário completo com todas as relações
  return user;
}