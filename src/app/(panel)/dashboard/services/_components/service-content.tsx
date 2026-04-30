import { canPermission } from '@/utils/permissions/canPermission';
import { getAllTypeServices } from '../_data_access/get-all-services';
import { ServicesList } from './services-list';
import { LabelSubscription } from '@/components/ui/label-subscription';
import { addDays, differenceInDays } from 'date-fns';
import prisma from '@/lib/prisma';
import { TRIAL_LIMITS } from '@/utils/permissions/trial-limits';
import { adjustTypeServicesToLimit } from '@/utils/permissions/adjust-type-services-to-limit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ServicesContentProps {
  userId: string;
}

export async function ServicesContent({ userId }: ServicesContentProps) {

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

  // 🔥 VALIDAÇÃO: SOMENTE ADMIN PODE ACESSAR
  const isAdmin = user.role === 'ADMIN';
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto mt-20">
          <Card className="border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100">
              <CardTitle className="flex items-center gap-3 text-xl text-red-900">
                <ShieldAlert className="w-6 h-6 text-red-600" />
                Acesso Restrito
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Área Exclusiva para Administradores
                  </h3>
                  <p className="text-gray-600">
                    Apenas administradores do sistema podem gerenciar tipos de atendimento.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Se você precisa adicionar ou modificar tipos de atendimento, entre em contato com um administrador.
                  </p>
                </div>
                <Link href="/dashboard">
                  <Button className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 🔥 USUÁRIO É ADMIN - CONTINUA NORMALMENTE
  const typeServices = await getAllTypeServices({ userId: userId })
  const permissions = await canPermission({ type: "service" })

  // 🔥 ADMIN NÃO TEM AJUSTE DE LIMITE (pode ter quantos quiser)
  if (!isAdmin && permissions.plan?.maxTypeServices) {
    const totalActive = typeServices.data?.length || 0;
    const maxServices = permissions.plan.maxTypeServices;

    if (totalActive > maxServices) {
      console.log(`[ServicesContent] Usuário tem ${totalActive} serviços ativos, mas limite é ${maxServices}`);
      
      const result = await adjustTypeServicesToLimit(userId, maxServices);
      
      if (result.adjusted) {
        console.log(`[ServicesContent] ${result.message}`);
        
        const updatedServices = await getAllTypeServices({ userId: userId });
        typeServices.data = updatedServices.data;
      }
    }
  }

  const trialEndDate = addDays(new Date(user.createdAt!), TRIAL_LIMITS);
  const daysRemaning = differenceInDays(trialEndDate, new Date());

  return (
    <ServicesList
      typeServices={typeServices.data || []}
      permission={permissions}
      isAdmin={isAdmin}
    />
  )
}