"use server"

import prisma from "@/lib/prisma"
import { addDays, isAfter, differenceInDays } from "date-fns"
import { TRIAL_LIMITS } from "@/utils/permissions/trial-limits"

export async function checkSubscription(userId: string) {
    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        include: {
            subscription: true
        }
    })

    if (!user) {
        throw new Error("Usuário não encontrado")
    }

    if(user.subscription && user.subscription.status === "active") {
        return {
            subscriptionStatus: "active",
            message: "Assinatura ativa.",
            planId: user.subscription.plan
        }
    }

    const trialEndDate = addDays(new Date(user.createdAt!), TRIAL_LIMITS);

    if (isAfter(new Date(), trialEndDate)) {
        return {
            subscriptionStatus: "EXPIRED",
            message: "Seu período de teste expirou.",
            planId: "TRIAL"
        }
    }

    const daysRemaning = differenceInDays(trialEndDate, new Date());

    return {
        subscriptionStatus: "TRIAL",
        message: `Você esta no período de teste gratuito. Faltam ${daysRemaning} dias`,
        planId: "TRIAL"
    }
   
}
