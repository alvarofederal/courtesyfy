"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Subscription } from "@/generated/prisma";
import { subscriptionPlans } from "@/utils/plans";
import { createPortalCustomer } from "../_actions/create-portal-customer";
import { toast } from "sonner";
import { CheckCircle2, CreditCard, Settings, Star, Calendar, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionDetailProps {
  subscription: Subscription;
}

export function SubscriptionDetail({ subscription }: SubscriptionDetailProps) {

    const subscriptionInfo = subscriptionPlans.find(plan => plan.id === subscription.plan);
    const isProfessional = subscription.plan === "PROFESSIONAL";

    async function handleManageSubscription() {
        const portal = await createPortalCustomer();

        if (portal.error) {
            toast.error("Ocorreu um erro ao criar o portal de assinatura");
            return;
        }

        window.location.href = portal.sessionId;
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <CreditCard className="w-8 h-8 text-emerald-600" />
                            Minha Assinatura
                        </h1>
                        <p className="text-gray-600 mt-1">Gerencie seu plano e benefícios</p>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-emerald-200 shadow-md">
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Plano Atual</p>
                                    <p className="text-xl font-bold text-gray-900 mt-1">
                                        {subscription.plan === "FREE" ? "Free" : "Professional"}
                                    </p>
                                </div>
                                {isProfessional ? (
                                    <Star className="h-8 w-8 text-emerald-500" />
                                ) : (
                                    <Zap className="h-8 w-8 text-gray-400" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 shadow-md">
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                                    <p className="text-xl font-bold text-green-600 mt-1">
                                        {subscription.status === "active" ? "Ativo" : "Inativo"}
                                    </p>
                                </div>
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 shadow-md">
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Valor</p>
                                    <p className="text-xl font-bold text-blue-600 mt-1">
                                        {subscriptionInfo?.price}/mês
                                    </p>
                                </div>
                                <CreditCard className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-purple-200 shadow-md">
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 uppercase">Próximo Ciclo</p>
                                    <p className="text-xl font-bold text-purple-600 mt-1">
                                        Em 30 dias
                                    </p>
                                </div>
                                <Calendar className="h-8 w-8 text-purple-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Card */}
                <Card className={cn(
                    "border-2 shadow-lg",
                    isProfessional ? "border-emerald-400" : "border-emerald-200"
                )}>
                    <CardHeader className={cn(
                        "border-b",
                        isProfessional 
                            ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100" 
                            : "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200"
                    )}>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    {isProfessional && <Star className="w-6 h-6 text-emerald-600" />}
                                    Plano {subscription.plan === "FREE" ? "Free" : "Professional"}
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    Sua assinatura está <strong className="text-green-600">ATIVA</strong> e renovará automaticamente
                                </CardDescription>
                            </div>
                            <div className={cn(
                                "px-4 py-2 rounded-full text-white font-semibold text-sm",
                                subscription.status === "active" 
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600" 
                                    : "bg-gray-400"
                            )}>
                                {subscription.status === "active" ? "ATIVO" : "INATIVO"}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                        <div className="mb-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-emerald-600" />
                                Benefícios do seu plano
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {subscriptionInfo && subscriptionInfo?.features.map((feature, index) => (
                                    <div 
                                        key={index} 
                                        className={cn(
                                            "flex items-start gap-2 p-3 rounded-lg",
                                            isProfessional ? "bg-emerald-50" : "bg-gray-50"
                                        )}
                                    >
                                        <CheckCircle2 className={cn(
                                            "w-5 h-5 mt-0.5 flex-shrink-0",
                                            isProfessional ? "text-emerald-600" : "text-gray-400"
                                        )} />
                                        <span className="text-sm text-gray-700">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!isProfessional && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                                <p className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                                    <Star className="w-5 h-5" />
                                    Faça upgrade para o Professional
                                </p>
                                <p className="text-sm text-gray-600">
                                    Desbloqueie todos os recursos e atenda mais clientes com múltiplos endereços e serviços ilimitados.
                                </p>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="bg-gray-50 border-t">
                        <div className="w-full flex flex-col sm:flex-row gap-3">
                            <Button 
                                onClick={handleManageSubscription}
                                className={cn(
                                    "flex-1 h-11 font-semibold",
                                    "bg-gradient-to-r from-emerald-500 to-teal-600",
                                    "hover:from-emerald-600 hover:to-teal-700"
                                )}>
                                <Settings className="w-4 h-4 mr-2" />
                                Gerenciar Assinatura
                            </Button>
                            
                            {isProfessional && (
                                <Button 
                                    variant="outline"
                                    className="flex-1 h-11 border-emerald-300 hover:bg-emerald-50"
                                    onClick={handleManageSubscription}>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Atualizar Pagamento
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>

                {/* Additional Info Card */}
                <Card className="border-emerald-200 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                        <CardTitle className="text-lg">Informações Importantes</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-3 text-sm">
                            <p className="text-gray-600">
                                • Você pode cancelar ou alterar seu plano a qualquer momento
                            </p>
                            <p className="text-gray-600">
                                • O cancelamento entrará em vigor no final do período de faturamento atual
                            </p>
                            <p className="text-gray-600">
                                • Todos os seus dados são mantidos em segurança mesmo após o cancelamento
                            </p>
                            <p className="text-gray-600">
                                • Para suporte, entre em contato conosco através do portal de assinatura
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
