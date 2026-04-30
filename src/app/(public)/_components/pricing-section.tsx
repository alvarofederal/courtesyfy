"use client"

// app/(home)/_components/pricing-section.tsx
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Check, Star, TrendingUp, Zap, ArrowRight, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { handleRegister } from '../_actions/login'

// ✅ IMPORTAR OS PLANOS DIRETAMENTE
export type PlanDetailProps = {
    maxTypeServices: number;
    serviceLocation?: number;
}

export type PlansProps = {
    FREE: PlanDetailProps;
    PROFESSIONAL: PlanDetailProps;
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
}



export function PricingSection() {

    async function handleLogin() {
        await handleRegister("google")
    }

    const subscriptionPlans = [
        {
            id: 'FREE',
            name: 'Free',
            oldPrice: "R$ 0,00",
            price: "R$ 0,00",
            description: 'Plano gratuito',
            features: [
                `${PLANS["FREE"].maxTypeServices} tipos de atendimento`,
                `${PLANS["FREE"].maxTypeServices}  Local de atendimento`,
                'Agendamentos ilimitados',
                'Suporte',
                'X',
                'X',
            ]
        },    {
            id: 'PROFESSIONAL',
            name: 'Profissional',
            oldPrice: "R$ 197,90",
            price: "R$ 97,90",
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

  return (
    <section id="planos" className="py-20 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="md:text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
            Planos e Preços
          </h2>
          <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
            Escolha o plano ideal para gerenciar sua agenda e expandir seu atendimento
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {subscriptionPlans.map((plan, index) => (
            <Card 
              key={plan.id} 
              className={cn(
                "relative border-2 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]",
                index === 1 
                  ? "border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-teal-50" 
                  : "border-gray-300"
              )}
            >
              {/* Badge Recomendado */}
              {index === 1 && (
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4" />
                    RECOMENDADO
                  </div>
                </div>
              )}
              
              <CardHeader className={cn(
                "border-b",
                index === 1 
                  ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100" 
                  : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
              )}>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {plan.id === "FREE" ? (
                    <Zap className="w-6 h-6 text-gray-600" />
                  ) : (
                    <Zap className="w-6 h-6 text-emerald-600" />
                  )}
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-base text-gray-600 mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                {/* Preço */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-4xl font-bold",
                      index === 1 ? "text-emerald-600" : "text-gray-900"
                    )}>
                      {plan.price}
                    </span>
                    <span className="text-gray-500">/mês</span>
                  </div>
                </div>
                
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={cn(
                        "w-5 h-5 mt-0.5 flex-shrink-0",
                        index === 1 ? "text-emerald-500" : "text-gray-400"
                      )} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="pt-6">
                    <Button 
                        className={cn(
                        "w-full h-12 text-base font-semibold",
                        index === 1
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                            : "bg-gray-800 hover:bg-gray-900"
                        )}
                        onClick={handleLogin}>
                        {plan.id === "FREE" ? "Começar Grátis" : "Assinar Agora"}
                        
                       <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="text-center">
          <Card className="max-w-3xl mx-auto border-emerald-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
              <CardTitle className="text-xl">Por que escolher o plano Professional?</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="font-semibold text-emerald-700 mb-1">✓ Serviços Ilimitados</p>
                  <p className="text-gray-600">Cadastre quantos serviços precisar</p>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg">
                  <p className="font-semibold text-teal-700 mb-1">✓ Múltiplos Locais</p>
                  <p className="text-gray-600">Atenda em diversos endereços</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="font-semibold text-emerald-700 mb-1">✓ Sem Limites</p>
                  <p className="text-gray-600">Agendamentos ilimitados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}