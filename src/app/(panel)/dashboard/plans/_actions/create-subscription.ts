// src/app/dashboard/plans/_actions/create-subscription.ts
"use server"

import { Plan } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/utils/stripe';
import { revalidatePath } from 'next/cache';

interface SubscriptionProps {
    type: Plan;
}

export async function createSubscription({type}: SubscriptionProps) {
    console.log("🔍 [DEBUG] Iniciando createSubscription, tipo:", type)
    
    const session = await auth();
    const userId = session?.user?.id;

    console.log("🔍 [DEBUG] Session userId:", userId)

    if(!userId) {
        console.error("❌ [DEBUG] Usuário não autenticado")
        return {
            sessionId: "",
            error: "Falha ao ativar plano - usuário não autenticado."
        }
    }
    
    const findUser = await prisma.user.findFirst({
        where: { id: userId }
    });

    console.log("🔍 [DEBUG] Usuário encontrado:", findUser?.email)

    if(!findUser) {
        console.error("❌ [DEBUG] Usuário não encontrado no banco")
        return {
            sessionId: "",
            error: "Falha ao ativar plano - usuário não encontrado."
        }
    }

    let customerId = findUser.stripeCustomerId;
    console.log("🔍 [DEBUG] Customer ID existente:", customerId)

    // Criar customer se não existir
    if(!customerId) {
        try {
            console.log("📝 [DEBUG] Criando novo customer no Stripe...")
            const stripeCustomer = await stripe.customers.create({
                email: findUser.email || undefined,
                metadata: {
                    userId: userId
                }
            });

            console.log("✅ [DEBUG] Customer criado:", stripeCustomer.id)

            await prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: stripeCustomer.id }
            });

            customerId = stripeCustomer.id;
            console.log("✅ [DEBUG] Customer ID salvo no banco")
            revalidatePath("/dashboard/plans");
        } catch (error) {
            console.error("❌ [DEBUG] Erro ao criar customer:", error);
            return {
                sessionId: "",
                error: `Falha ao criar customer no Stripe: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
            }
        }
    }

    // Verificar variáveis de ambiente
    const priceId = type === "FREE" 
        ? process.env.STRIPE_PLAN_FREE 
        : process.env.STRIPE_PLAN_PROFESSIONAL;

    console.log("🔍 [DEBUG] Price ID:", priceId)
    console.log("🔍 [DEBUG] Success URL:", process.env.STRIPE_SUCCESS_URL)
    console.log("🔍 [DEBUG] Cancel URL:", process.env.STRIPE_CANCEL_URL)

    if (!priceId) {
        console.error("❌ [DEBUG] Price ID não configurado para plano:", type)
        return {
            sessionId: "",
            error: "Plano não configurado corretamente"
        }
    }

    // Criar checkout session
    try {
        console.log("💳 [DEBUG] Criando checkout session...")
        
        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            billing_address_collection: "required",
            line_items: [
                { 
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: { 
                type: type,
                userId: userId
            },
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: process.env.STRIPE_SUCCESS_URL || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription`,
            cancel_url: process.env.STRIPE_CANCEL_URL || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/plans`,
        })

        console.log("✅ [DEBUG] Checkout session criada:", stripeCheckoutSession.id)
        console.log("✅ [DEBUG] Checkout URL:", stripeCheckoutSession.url)

        revalidatePath("/dashboard/plans");

        return {
            sessionId: stripeCheckoutSession.id,
            url: stripeCheckoutSession.url,
        }

    } catch (error) {
        console.error("❌ [DEBUG] Erro ao criar checkout:", error)
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        return {
            sessionId: "",
            error: `Falha ao criar checkout: ${errorMessage}`
        }
    }
}