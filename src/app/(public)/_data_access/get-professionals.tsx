// src/app/(public)/_data_access/get-professionals.ts
"use server"

import prisma from "@/lib/prisma"
import type { Prisma, Subscription } from "@/generated/prisma"

// Definir o tipo de retorno
export type ProfessionalWithSubscription = Prisma.UserGetPayload<{
  include: {
    subscription: true
    addresses: true
  }
}>

export async function getProfessionals(): Promise<ProfessionalWithSubscription[]> {
    try {
        const professionals = await prisma.user.findMany({
            where: {
                status: true,           // ✅ Apenas ATIVOS
                role: {
                    not: 'ADMIN'        // ✅ Excluir ADMINS
                }
            },
            include: {
                subscription: true,
                addresses: true,
            },
            // ✅ Buscar todos sem orderBy/take aqui, 
            // pois a ordenação personalizada acontece no sort() abaixo
        });

        // ✅ Ordena: PROFESSIONAL primeiro, depois FREE, depois sem assinatura
        // Dentro de cada grupo, ordena por antiguidade (createdAt ascendente - mais antigo primeiro)
        return professionals.sort((a, b) => {
            const getPriority = (sub: Subscription | null) => {
                if (!sub || sub.status !== 'active') return 3; // ✅ sem assinatura ou inativa
                if (sub.plan === 'PROFESSIONAL') return 1;     // ✅ PROFESSIONAL no topo
                if (sub.plan === 'FREE') return 2;             // ✅ FREE no meio
                return 3;
            };

            const aPriority = getPriority(a.subscription);
            const bPriority = getPriority(b.subscription);

            // Se prioridades diferentes, ordena por prioridade
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }

            // ✅ Mesmo grupo, ordena por createdAt ascendente (mais antigo primeiro)
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

    } catch (error) {
        console.error('Erro ao buscar profissionais:', error);
        return [];
    }
}