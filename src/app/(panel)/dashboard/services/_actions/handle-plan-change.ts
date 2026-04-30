// src/app/dashboard/type-services/_actions/handle-plan-change.ts
"use server"

import prisma from "@/lib/prisma";
import { adjustTypeServicesToLimit } from "@/utils/permissions/adjust-type-services-to-limit";
import { revalidatePath } from "next/cache";

type PlanType = "FREE" | "PROFESSIONAL" | "TRIAL" | "EXPIRED";

interface HandlePlanChangeProps {
  userId: string;
  oldPlan: PlanType;
  newPlan: PlanType;
}

// Limites de TIPOS DE ATENDIMENTO por plano
const PLAN_LIMITS = {
  FREE: 1,
  PROFESSIONAL: 5,  // ✅ TypeService tem limite de 5 (não 10)
  TRIAL: null, // ilimitado
  EXPIRED: 0
} as const;

/**
 * Gerencia a mudança de plano e ajusta o status dos tipos de atendimento
 */
export async function handlePlanChange({ userId, oldPlan, newPlan }: HandlePlanChangeProps) {
  console.log(`[handlePlanChange] User ${userId}: ${oldPlan} → ${newPlan}`);

  try {
    // Caso 1: UPGRADE para PROFESSIONAL
    if (newPlan === 'PROFESSIONAL' && (oldPlan === 'FREE' || oldPlan === 'TRIAL')) {
      console.log('[handlePlanChange] UPGRADE para PROFESSIONAL - Reativando tipos de atendimento');

      const maxTypeServices = PLAN_LIMITS.PROFESSIONAL;

      // Reativa TODOS os tipos de atendimento (UserTypeService com active: true)
      const reactivatedTypeServices = await prisma.userTypeService.updateMany({
        where: {
          userId: userId,
          active: false  // ✅ active em vez de status
        },
        data: {
          active: true  // ✅ active em vez de status
        }
      });

      console.log(`[handlePlanChange] ${reactivatedTypeServices.count} tipo(s) de atendimento reativado(s)`);

      // 🔥 Ajusta ao limite se tiver mais de 5 ativos
      const adjustResult = await adjustTypeServicesToLimit(userId, maxTypeServices);
      
      if (adjustResult.adjusted) {
        console.log(`[handlePlanChange] ${adjustResult.message}`);
      }

      const totalActive = adjustResult.totalActive || maxTypeServices;

      revalidatePath("/dashboard/type-services");  // ✅ Caminho correto

      return {
        success: true,
        message: `Upgrade realizado! Você agora tem ${totalActive} tipo(s) de atendimento ativo(s) no plano Professional.`,
        reactivatedCount: reactivatedTypeServices.count,
        totalActive: totalActive
      };
    }

    // Caso 2: DOWNGRADE para FREE
    if (newPlan === 'FREE' && (oldPlan === 'PROFESSIONAL' || oldPlan === 'TRIAL')) {
      console.log('[handlePlanChange] DOWNGRADE para FREE - Mantendo apenas o mais recente');

      const maxTypeServices = PLAN_LIMITS.FREE;

      // 🔥 Usa adjustTypeServicesToLimit que já mantém apenas os N mais recentes
      const adjustResult = await adjustTypeServicesToLimit(userId, maxTypeServices);

      const totalTypeServices = await prisma.userTypeService.count({
        where: { userId: userId }
      });

      revalidatePath("/dashboard/type-services");  // ✅ Caminho correto

      return {
        success: true,
        message: `Plano alterado para Free. Você tem ${totalTypeServices} tipo(s) de atendimento cadastrado(s), mas apenas ${maxTypeServices} está ativo. Faça upgrade para Professional para acessar até 5 tipos!`,
        totalTypeServices: totalTypeServices,
        activeTypeServices: maxTypeServices,
        deactivated: adjustResult.deactivated || 0
      };
    }

    // Caso 3: TRIAL → FREE
    if (newPlan === 'FREE' && oldPlan === 'TRIAL') {
      console.log('[handlePlanChange] TRIAL → FREE');
      
      // Reutiliza lógica de downgrade
      return await handlePlanChange({ userId, oldPlan: 'PROFESSIONAL', newPlan: 'FREE' });
    }

    // Caso 4: TRIAL → PROFESSIONAL
    if (newPlan === 'PROFESSIONAL' && oldPlan === 'TRIAL') {
      console.log('[handlePlanChange] TRIAL → PROFESSIONAL - Ajustando ao limite');
      
      const maxTypeServices = PLAN_LIMITS.PROFESSIONAL;

      // Garante que todos estejam ativos
      await prisma.userTypeService.updateMany({
        where: { userId },
        data: { active: true }  // ✅ active em vez de status
      });

      // 🔥 Ajusta ao limite (mantém apenas os 5 mais recentes ativos)
      const adjustResult = await adjustTypeServicesToLimit(userId, maxTypeServices);

      const totalActive = adjustResult.totalActive || maxTypeServices;

      revalidatePath("/dashboard/type-services");  // ✅ Caminho correto

      return {
        success: true,
        message: `Bem-vindo ao plano Professional! Você tem ${totalActive} tipo(s) de atendimento ativo(s).`,
        activeTypeServices: totalActive,
        adjusted: adjustResult.adjusted
      };
    }

    // Caso 5: Sem mudança significativa
    console.log('[handlePlanChange] Sem alterações necessárias nos tipos de atendimento');
    
    return {
      success: true,
      message: 'Plano atualizado com sucesso.',
    };

  } catch (error) {
    console.error('[handlePlanChange] Error:', error);
    return {
      success: false,
      message: 'Erro ao atualizar tipos de atendimento após mudança de plano.',
      error: error
    };
  }
}

/**
 * Função auxiliar para ser chamada após atualizar subscription
 */
export async function syncTypeServicesAfterSubscriptionUpdate(userId: string) {
  console.log('[syncTypeServicesAfterSubscriptionUpdate] Sincronizando tipos de atendimento para user:', userId);

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId }
    });

    if (!subscription) {
      console.log('[syncTypeServicesAfterSubscriptionUpdate] Nenhuma subscription encontrada');
      return { success: false, message: 'Subscription não encontrada' };
    }

    const currentPlan = subscription.plan as PlanType;
    const maxTypeServices = PLAN_LIMITS[currentPlan];

    console.log('[syncTypeServicesAfterSubscriptionUpdate] Plano atual:', currentPlan);

    if (currentPlan === 'PROFESSIONAL' && maxTypeServices) {
      // 🔥 Ajusta ao limite
      const adjustResult = await adjustTypeServicesToLimit(userId, maxTypeServices);
      
      revalidatePath("/dashboard/type-services");  // ✅ Caminho correto
      
      return {
        success: true,
        message: adjustResult.adjusted 
          ? `${adjustResult.deactivated} tipo(s) de atendimento desativado(s), mantidos os ${maxTypeServices} mais recentes`
          : `Tipos de atendimento já estão dentro do limite (${adjustResult.totalActive}/${maxTypeServices})`
      };
    }

    if (currentPlan === 'FREE' && maxTypeServices) {
      // Mantém apenas o mais recente
      const adjustResult = await adjustTypeServicesToLimit(userId, maxTypeServices);

      revalidatePath("/dashboard/type-services");  // ✅ Caminho correto

      return {
        success: true,
        message: 'Tipos de atendimento ajustados para o plano Free (apenas o mais recente ativo)'
      };
    }

    return { success: true, message: 'Nenhum ajuste necessário' };

  } catch (error) {
    console.error('[syncTypeServicesAfterSubscriptionUpdate] Error:', error);
    return {
      success: false,
      message: 'Erro ao sincronizar tipos de atendimento',
      error
    };
  }
}