// utils/stripe-config.ts
// Configuração centralizada dos planos e Price IDs do Stripe

export const STRIPE_PRICE_IDS = {
  FREE: process.env.NEXT_PUBLIC_STRIPE_FREE_PRICE_ID || '',
  PROFESSIONAL: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || '',
  // Adicione mais planos aqui conforme necessário
  // ENTERPRISE: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || '',
} as const;

/**
 * Mapeia um Price ID do Stripe para o tipo de plano do sistema
 */
export function getPlanFromPriceId(priceId: string): 'FREE' | 'PROFESSIONAL' | 'TRIAL' {
  switch (priceId) {
    case STRIPE_PRICE_IDS.PROFESSIONAL:
      return 'PROFESSIONAL';
    case STRIPE_PRICE_IDS.FREE:
      return 'FREE';
    default:
      // Se não reconhecemos o price, assumir FREE como fallback
      console.warn(`⚠️ Price ID não reconhecido: ${priceId}, usando FREE como fallback`);
      return 'FREE';
  }
}

/**
 * Obtém o Price ID do Stripe baseado no tipo de plano
 */
export function getPriceIdFromPlan(plan: 'FREE' | 'PROFESSIONAL'): string {
  return STRIPE_PRICE_IDS[plan] || STRIPE_PRICE_IDS.FREE;
}

/**
 * Verifica se um Price ID é válido
 */
export function isValidPriceId(priceId: string): boolean {
  return Object.values(STRIPE_PRICE_IDS).includes(priceId);
}

// Informações dos planos (para uso no frontend)
export const PLAN_INFO = {
  FREE: {
    name: 'Free',
    displayName: 'Plano Free',
    price: 0,
    currency: 'BRL',
    interval: 'month',
    features: [
      '1 serviço ativo',
      'Histórico preservado',
      'Agendamentos básicos',
    ]
  },
  PROFESSIONAL: {
    name: 'Professional',
    displayName: 'Plano Professional',
    price: 29.90, // Ajuste conforme seu preço
    currency: 'BRL',
    interval: 'month',
    features: [
      'Até 10 serviços ativos',
      'Histórico completo',
      'Agendamentos ilimitados',
      'Suporte prioritário',
    ]
  }
} as const;