"use client"

import { Button } from '@/components/ui/button'
import { Plan } from '@/generated/prisma';
import { createSubscription } from '../_actions/create-subscription';
import { toast } from 'sonner';
import { getStripeJs } from '@/utils/stripe-js';

interface SubscriptionButtonProps {
    type: Plan;
}

export function SubscriptionButton({ type }: SubscriptionButtonProps) {

    async function handleCreateBillingPortal() {

        console.log("CRIANDO SUBSCRIPTION PARA O TIPO: ", type);

        const {sessionId, error, url} = await createSubscription({type: type});

        console.log("SESSION ID: ", sessionId);
        console.log("ERROR: ", error);
        console.log("URL: ", url);

        if(error) {
            toast.error(error);
            return;
        }

        const stripe = await getStripeJs();
        console.log("STRIPE OBTIDO NO BUTTON: ", stripe);

        if(stripe && url) {
            window.location.href = url;
        }
    }

    return (
        <Button 
            className={`w-full ${type === "PROFESSIONAL" && "bg-emerald-500 hover:bg-emerald-600"}` }
            onClick={handleCreateBillingPortal} >
            Ativar assinatura
        </Button>
    )
}