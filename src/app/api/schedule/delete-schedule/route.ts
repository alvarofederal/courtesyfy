// app/api/schedule/delete-schedule/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from "@/lib/auth";

/**
 * DELETE /api/schedule/delete-schedule
 * 
 * Remove agenda completa pela CHAVE COMPOSTA:
 * - userId (da sessão)
 * - date
 * - address
 * - typeServiceId
 * 
 * CRÍTICO: Valida que o usuário só pode deletar suas próprias agendas
 */
export async function DELETE(req: NextRequest) {
    try {
        // SEGURANÇA: Verificar autenticação
        const session = await auth()
        
        if (!session || !session.user?.id) {
            return NextResponse.json({
                error: "Não autorizado"
            }, {
                status: 401
            });
        }

        const body = await req.json();
        const { userId, date, address, typeServiceId } = body;

        if (!userId || !date || !address || !typeServiceId) {
        return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
        }

        if (userId !== session.user.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        console.log('🗑️ Deletando agenda:', { userId, date, address, typeServiceId });

        // Buscar appointments ativos nessa data/local/serviço
        const existingAppointments = await prisma.appointment.findMany({
        where: {
            userId,
            appointmentDate: new Date(date),
            address,
            typeServiceId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            time: true,
        }
        });

        console.log(`📋 Encontrados ${existingAppointments.length} agendamentos de pacientes`);

        // Deletar agendamentos dos pacientes
        if (existingAppointments.length > 0) {
        await prisma.appointment.deleteMany({
            where: {
            userId,
            appointmentDate: new Date(date),
            address,
            typeServiceId,
            },
        });
        console.log(`✅ ${existingAppointments.length} agendamentos de pacientes deletados`);
        }

        // Deletar slots disponíveis
        await prisma.availableSlot.deleteMany({
        where: {
            userId,
            date: new Date(date),
            address,
            typeServiceId,
        },
        });

        console.log('✅ Agenda limpa com sucesso');

        return NextResponse.json({ 
        success: true,
        deletedAppointments: existingAppointments.length,
        appointments: existingAppointments // Para enviar emails depois
        });

    } catch (error) {
        console.error('❌ Erro ao deletar agenda:', error);
        return NextResponse.json({ error: 'Erro ao deletar agenda' }, { status: 500 });
    }
}