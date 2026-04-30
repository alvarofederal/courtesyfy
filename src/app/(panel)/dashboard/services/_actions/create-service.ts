// src/app/dashboard/type-services/_actions/create-type-service.ts
"use server"

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { canCreateTypeService } from '@/utils/permissions/canCreateService'

// ✅ SCHEMA ZOD COM DESCRIPTION
const formSchema = z.object({
  name: z.string().min(1, { message: "O nome do tipo é obrigatório" }),
  description: z.string().nullable().optional(),  // ← TEM DESCRIPTION!
  duration: z.number().min(1, { message: "A duração deve ser maior que 0" }),
})

// ✅ TIPO INFERIDO DO ZOD (não usa interface separada)
type FormSchema = z.infer<typeof formSchema>

export async function createNewTypeService(formData: FormSchema) {
  console.log('[createNewTypeService] START', formData);

  const session = await auth();

  if (!session?.user?.id) {
    console.log('[createNewTypeService] No session');
    return {
      error: "Falha ao cadastrar tipo - Usuário não autenticado",
    }
  }

  console.log('[createNewTypeService] User:', session.user.id);

  // Validação do schema
  const schema = formSchema.safeParse(formData);

  if (!schema.success) {
    console.log('[createNewTypeService] Schema validation failed:', schema.error);
    return {
      error: schema.error.issues[0].message
    }
  }

  try {
    // 1. Buscar subscription do usuário
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
      }
    });

    console.log('[createNewTypeService] Subscription:', subscription?.plan, subscription?.status);

    // 2. Validar permissão
    const permission = await canCreateTypeService(subscription, session);

    console.log('[createNewTypeService] Permission:', {
      hasPermission: permission.hasPermission,
      planId: permission.planId,
      expired: permission.expired,
      maxTypeServices: permission.plan?.maxTypeServices
    });

    // 3. Verificar se tem permissão para criar
    if (!permission.hasPermission) {
      console.log('[createNewTypeService] BLOQUEADO - Sem permissão');

      // Mensagens customizadas baseadas no status
      if (permission.expired) {
        return {
          error: "Sua assinatura expirou. Renove seu plano para continuar criando tipos de atendimento.",
        }
      }

      const maxTypeServices = permission.plan?.maxTypeServices || 1;
      
      // Conta tipos ativos para mostrar na mensagem
      const currentCount = await prisma.userTypeService.count({
        where: {
          userId: session.user.id,
          active: true
        }
      });

      const planMessage = permission.planId === 'FREE' 
        ? `Você atingiu o limite de ${maxTypeServices} tipo ativo do plano Free. Você já possui ${currentCount} tipo(s) ativo(s). Faça upgrade para o plano Professional e tenha até 5 tipos ativos!`
        : `Você atingiu o limite de ${maxTypeServices} tipos ativos do seu plano ${permission.planId}. Você já possui ${currentCount} tipo(s) ativo(s).`;
      
      console.log('[createNewTypeService] Error message:', planMessage);

      return {
        error: planMessage,
      }
    }

    console.log('[createNewTypeService] PERMITIDO - Preparando para criar tipo');

    // 4. LÓGICA INTELIGENTE: Se plano FREE, desativa todos os tipos anteriores
    if (permission.planId === 'FREE') {
      console.log('[createNewTypeService] Plano FREE detectado - Desativando tipos anteriores');
      
      const deactivatedCount = await prisma.userTypeService.updateMany({
        where: {
          userId: session.user.id,
          active: true
        },
        data: {
          active: false
        }
      });

      console.log(`[createNewTypeService] ${deactivatedCount.count} tipo(s) desativado(s)`);
    }

    // ✅ 5. CRIAR TIPO COM DESCRIPTION
    const newTypeService = await prisma.typeService.create({
      data: {
        name: formData.name,
        description: formData.description || null,  // ← DESCRIPTION AQUI!
        duration: formData.duration,
        status: true,
      }
    })

    console.log('[createNewTypeService] TypeService created:', newTypeService.id);

    // 6. Criar a relação UserTypeService (sempre ativa)
    await prisma.userTypeService.create({
      data: {
        userId: session.user.id,
        typeServiceId: newTypeService.id,
        active: true,
      }
    });

    console.log('[createNewTypeService] UserTypeService relation created');

    // 7. Contar tipos ativos e total para feedback
    const currentActiveCount = await prisma.userTypeService.count({
      where: {
        userId: session.user.id,
        active: true
      }
    });

    const totalCount = await prisma.userTypeService.count({
      where: {
        userId: session.user.id
      }
    });

    const maxTypeServices = permission.plan?.maxTypeServices;
    
    let successMessage = `Tipo de atendimento criado com sucesso!`;
    
    if (permission.planId === 'FREE') {
      successMessage += ` Você tem ${totalCount} tipo(s) cadastrado(s), mas apenas 1 está ativo no plano Free.`;
      if (totalCount > 1) {
        successMessage += ` Faça upgrade para Professional e ative até 5 tipos!`;
      }
    } else if (maxTypeServices !== null) {
      successMessage += ` (${currentActiveCount}/${maxTypeServices} ativos)`;
    }

    revalidatePath("/dashboard/type-services")
    revalidatePath("/dashboard/services")

    console.log('[createNewTypeService] SUCCESS', successMessage);

    return {
      data: newTypeService,
      success: successMessage
    }

  } catch (err) {
    console.error('[createNewTypeService] Error:', err);
    return {
      error: "Falha ao cadastrar tipo de atendimento. Tente novamente.",
    }
  }
}