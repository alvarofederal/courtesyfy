// src/utils/permissions/canCreateTypeService.ts
"use server"

import { Subscription } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { Session } from "next-auth";
import { getPlan } from "./get-plans";
import { PLANS } from "../plans";
import { checkSubscriptionExpired } from "./checkSubscriptionExpired";
import { ResultPermissionProp } from "./canPermission";

export async function canCreateTypeService(subscription: Subscription | null, session: Session): Promise<ResultPermissionProp> {
    try {
        // 🔥 Conta UserTypeService com active: true (equivalente a service com status: true)
        const typeServiceCount = await prisma.userTypeService.count({
            where: {
                userId: session?.user?.id,
                active: true  // ✅ active em vez de status
            }
        })

        if (subscription && subscription.status === "active") {
            const plan = subscription.plan;
            const planLimits = await getPlan(plan);

            // Verifica a quantidade de tipos de atendimento criados pelo usuário, em uma assinatura ativa, 
            // para bloquear a criação de novos tipos caso tenha atingido o limite
            return {
                hasPermission: planLimits.maxTypeServices === null || typeServiceCount < planLimits.maxTypeServices,  // ✅ maxTypeServices
                planId: subscription.plan,
                expired: false,
                plan: PLANS[subscription.plan],
            };
        }

        const checkTesteLimit = await checkSubscriptionExpired(session);
        return checkTesteLimit;

    } catch (error) {
        return {
            hasPermission: false,
            planId: "EXPIRED",
            expired: false,
            plan: null,
        };
    }
}