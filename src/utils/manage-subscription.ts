// src/utils/manage-subscription.ts

import prisma from "@/lib/prisma";
import { Plan, SubscriptionStatus } from "@/generated/prisma";

export async function manageSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false,
  deleteAction = false,
  planType: Plan = "FREE"
) {
  try {
    // ✅ Buscar os dados da subscription no Stripe
    const customerData = await prisma.user.findFirst({
      where: {
        stripeCustomerId: customerId,
      },
    });

    if (!customerData) {
      console.log("❌ CUSTOMER NÃO ENCONTRADO");
      throw new Error("Customer não encontrado");
    }

    // ✅ DELETAR subscription
    if (deleteAction) {
      console.log("🗑️ DELETANDO ASSINATURA...");
      
      await prisma.subscription.delete({
        where: {
          userId: customerData.id,
        },
      });

      console.log("✅ ASSINATURA DELETADA");
      return;
    }

    // ✅ Determinar o priceId baseado no plano
    const priceId = planType === "PROFESSIONAL" 
      ? process.env.STRIPE_PROFESSIONAL_PRICE_ID!
      : process.env.STRIPE_FREE_PRICE_ID || "free";

    // ✅ Montar dados da subscription COMPLETOS
    const subscriptionData = {
      userId: customerData.id,
      stripeCustomerId: customerId,           // ✅ ADICIONAR
      stripeSubscriptionId: subscriptionId,   // ✅ ADICIONAR
      stripePriceId: priceId,                 // ✅ RENOMEAR de priceId
      plan: planType,
      status: "active" as SubscriptionStatus, // ✅ CORRIGIR TIPO
    };

    // ✅ CRIAR subscription
    if (createAction) {
      console.log("📝 CRIANDO ASSINATURA...");
      
      try {
        await prisma.subscription.create({
          data: subscriptionData,
        });
        console.log("✅ ASSINATURA CRIADA");
      } catch (error) {
        console.log("❌ ERRO AO CRIAR ASSINATURA:", error);
        throw error;
      }
      return;
    }

    // ✅ ATUALIZAR subscription existente
    console.log("🔄 ATUALIZANDO ASSINATURA...");
    
    try {
      await prisma.subscription.update({
        where: {
          userId: customerData.id,
        },
        data: {
          stripePriceId: priceId,
          plan: planType,
          status: "active" as SubscriptionStatus,
          stripeSubscriptionId: subscriptionId, // ✅ Atualizar também
        },
      });
      console.log("✅ ASSINATURA ATUALIZADA");
    } catch (error) {
      console.log("❌ ERRO AO ATUALIZAR ASSINATURA:", error);
      throw error;
    }

  } catch (error) {
    console.error("❌ ERRO EM manageSubscription:", error);
    throw error;
  }
}