//  app/api/schedule/get-appointments/route.ts

import { auth } from "@/lib/auth"; // Ajuste o caminho conforme sua estrutura
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/schedule/get-existing-schedule
 * 
 * Busca agenda existente pela CHAVE COMPOSTA:
 * - userId (da sessão)
 * - date
 * - address
 * - typeServiceId
 * 
 * CRÍTICO: Esta é a função que mantém a integridade dos dados
 * garantindo que cada profissional veja apenas suas próprias agendas
 */
export async function GET(request: NextRequest) {
    try {
        // SEGURANÇA: Verificar autenticação
        // REGRA GERAL 2: Verificar autenticação e autorização
        //const session = await getSession();
        
        const session = await auth()
        
        if (!session || !session.user?.id) {
            return NextResponse.json({
                error: "Não autorizado"
            }, {
                status: 401
            });
        }

        const { searchParams } = request.nextUrl;
        const userId = searchParams.get('userId');
        const dateParam = searchParams.get('date');
        const addressParam = searchParams.get('address');
        const typeServiceId = searchParams.get('typeServiceId');


        // SEGURANÇA: Validar que userId do request é o mesmo da sessão
        if (!userId || userId !== session.user.id) {
            console.error('❌ Tentativa de acesso não autorizado:', {
                requestUserId: userId,
                sessionUserId: session.user.id
            });
            return NextResponse.json({
                error: "Acesso negado"
            }, {
                status: 403
            });
        }

        // Validar parâmetros obrigatórios da CHAVE COMPOSTA
        if (!dateParam || !addressParam || !typeServiceId) {
            return NextResponse.json({
                error: "Parâmetros incompletos. Necessário: date, address, typeServiceId"
            }, {
                status: 400
            });
        }

        // Parse e validar data
        const [year, month, day] = dateParam.split("-").map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return NextResponse.json({
                error: "Data inválida"
            }, {
                status: 400
            });
        }

        const targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

        console.log('🔍 Buscando agenda existente com chave composta:', {
            userId: session.user.id,
            date: dateParam,
            address: addressParam,
            typeServiceId: typeServiceId
        });

        // QUERY CRÍTICA: Buscar AvailableSlot pela CHAVE COMPOSTA
        // userId + date + address + typeServiceId = ÚNICO registro
        const existingSchedule = await prisma.availableSlot.findFirst({
            where: {
                userId: session.user.id, // SEMPRE da sessão
                date: targetDate,
                address: addressParam,
                typeServiceId: typeServiceId,
                status: 'AVAILABLE', // Apenas slots disponíveis
            },
            select: {
                id: true,
                userId: true,
                address: true,
                typeServiceId: true,
                date: true,
                times: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc', // Pegar o mais recente se houver duplicatas
            },
        });

        if (!existingSchedule) {
            console.log('📭 Nenhuma agenda encontrada para a chave composta');
            return NextResponse.json({
                message: "Nenhuma agenda encontrada"
            }, {
                status: 404
            });
        }

        console.log('✅ Agenda encontrada:', {
            id: existingSchedule.id,
            timesCount: existingSchedule.times.length,
            times: existingSchedule.times
        });

        // Retornar agenda existente
        return NextResponse.json(existingSchedule);

    } catch (error) {
        console.error("❌ Erro ao buscar agenda existente:", error);
        return NextResponse.json({
            error: "Erro ao buscar agenda"
        }, {
            status: 500
        });
    }
}