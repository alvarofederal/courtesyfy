
export type PlanDetailProps = {
    maxTypeServices: number;
    serviceLocation?: number;
}

export type PlansProps = {
    FREE: PlanDetailProps;
    PROFESSIONAL: PlanDetailProps;
    COURTESY: PlanDetailProps;
}

export const PLANS: PlansProps = {
    FREE: {
        maxTypeServices: 1,
        serviceLocation: 1
    },
    PROFESSIONAL: {
        maxTypeServices: 10,
        serviceLocation: 10
    },
    COURTESY: {
        maxTypeServices: 10,
        serviceLocation: 10
    },
}

export const subscriptionPlans = [
    {
        id: 'FREE',
        name: 'Free',
        oldPrice: "R$ 0,00",
        price: "R$ 0,00",
        description: 'Plano gratuito',
        features: [
            `${PLANS["FREE"].maxTypeServices} tipo de atendimento`,
            `${PLANS["FREE"].maxTypeServices}  Local de atendimento`,
            'Agendamentos ilimitados',
            'Suporte',
            'X',
            'X',
        ]
    },    {
        id: 'PROFESSIONAL',
        name: 'Profissional',
        oldPrice: "R$ 1518,90",
        price: "R$ 151,80",
        description: 'Plano avançado',
        features: [
            `${PLANS["PROFESSIONAL"].maxTypeServices} tipos de atendimento`,
            `${PLANS["PROFESSIONAL"].maxTypeServices}  Locais de atendimento`,
            'Agendamentos ilimitados',
            'Aparece no topo da lista de profissionais',
            'Tele-atendimento',
            'Suporte prioritário',
        ]
    }
]