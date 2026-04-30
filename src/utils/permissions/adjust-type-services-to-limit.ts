// src/utils/permissions/adjust-type-services-to-limit.ts
"use server"

import prisma from "@/lib/prisma"

export async function adjustTypeServicesToLimit(userId: string, maxActive: number) {
  console.log(`[adjustTypeServicesToLimit] User ${userId}, max: ${maxActive}`);

  try {
    const allUserTypeServices = await prisma.userTypeService.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    const totalTypes = allUserTypeServices.length

    if (totalTypes <= maxActive) {
      await prisma.userTypeService.updateMany({
        where: { userId },
        data: { active: true }
      })

      return {
        adjusted: false,
        totalActive: totalTypes,
        deactivated: 0,
        message: `Todos os ${totalTypes} tipos estão ativos (dentro do limite de ${maxActive})`
      }
    }

    const toKeepActive = allUserTypeServices.slice(0, maxActive).map(uts => uts.id)
    const toDeactivate = allUserTypeServices.slice(maxActive).map(uts => uts.id)

    await prisma.userTypeService.updateMany({
      where: {
        id: { in: toKeepActive }
      },
      data: { active: true }
    })

    if (toDeactivate.length > 0) {
      await prisma.userTypeService.updateMany({
        where: {
          id: { in: toDeactivate }
        },
        data: { active: false }
      })
    }

    console.log(`[adjustTypeServicesToLimit] Mantidos ${maxActive} ativos, desativados ${toDeactivate.length}`);

    return {
      adjusted: true,
      totalActive: maxActive,
      deactivated: toDeactivate.length,
      message: `${toDeactivate.length} tipo(s) desativado(s), mantidos os ${maxActive} mais recentes ativos`
    }

  } catch (error) {
    console.error('[adjustTypeServicesToLimit] Error:', error);
    return {
      adjusted: false,
      totalActive: 0,
      deactivated: 0,
      message: 'Erro ao ajustar tipos de atendimento',
      error
    }
  }
}