"use server"

import { Subscription } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { Session } from "next-auth";
import { PLANS } from "../plans";

export async function canAddAddress(subscription: Subscription | null, session: Session): Promise<{
  hasPermission: boolean;
  planId: string;
  expired: boolean;
  plan: typeof PLANS[keyof typeof PLANS] | null;
  currentCount: number;
  maxAddresses: number | null;
}> {
  try {
    // Conta endereços ativos do usuário
    const addressCount = await prisma.userAddress.count({
      where: {
        userId: session?.user?.id,
      }
    });

    console.log(`[canAddAddress] User: ${session.user.id}, Current Addresses: ${addressCount}`);

    if (subscription && subscription.status === "active") {
      const plan = subscription.plan;
      const planLimits = PLANS[plan];

      // Obter limite de endereços (similar aos serviços)
      // FREE: 1, PROFESSIONAL: 10
      const maxAddresses = planLimits.maxTypeServices; // Reutiliza mesmo limite dos serviços

      console.log(`[canAddAddress] Plan: ${plan}, Max Addresses: ${maxAddresses}, Current: ${addressCount}`);

      const hasPermission = maxAddresses === null || addressCount < maxAddresses;

      console.log(`[canAddAddress] Has Permission: ${hasPermission}`);

      return {
        hasPermission: hasPermission,
        planId: subscription.plan,
        expired: false,
        plan: planLimits,
        currentCount: addressCount,
        maxAddresses: maxAddresses
      };
    }

    // Se não tem subscription ativa, assume FREE (limite 1)
    console.log(`[canAddAddress] No active subscription, defaulting to FREE (limit: 1)`);

    return {
      hasPermission: addressCount < 1,
      planId: "FREE",
      expired: false,
      plan: PLANS.FREE,
      currentCount: addressCount,
      maxAddresses: 1
    };

  } catch (error) {
    console.error('[canAddAddress] Error:', error);
    return {
      hasPermission: false,
      planId: "EXPIRED",
      expired: false,
      plan: null,
      currentCount: 0,
      maxAddresses: 0
    };
  }
}