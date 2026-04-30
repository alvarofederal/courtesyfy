import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { fromUTCDateString } from "@/utils/dateUtils";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session || !session.user?.id) {
            return NextResponse.json({
                error: "Não autorizado"
            }, { status: 401 });
        }

        const { searchParams } = request.nextUrl;
        const userId = searchParams.get('userId');
        const dateParam = searchParams.get('date');

        if (!userId || userId !== session.user.id) {
            return NextResponse.json({
                error: "Acesso negado"
            }, { status: 403 });
        }

        if (!dateParam) {
            return NextResponse.json({
                error: "Data é obrigatória"
            }, { status: 400 });
        }

        // ✅ CRÍTICO: Converter data para UTC 00:00:00
        const targetDate = fromUTCDateString(dateParam);

        console.log('🔍 Buscando agendamentos:', {
            userId: session.user.id,
            dateString: dateParam,
            dateUTC: targetDate.toISOString()
        });

        const dateSchedules = await prisma.availableSlot.findMany({
            where: {
                userId: session.user.id,
                date: targetDate,
                status: 'AVAILABLE',
            },
            select: {
                id: true,
                userId: true,
                address: true,
                typeServiceId: true,
                date: true,
                times: {
                    select: {
                        time: true,
                    },
                    orderBy: {
                        time: 'asc',
                    },
                },
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        if (dateSchedules.length === 0) {
            return NextResponse.json({
                message: "Nenhum agendamento encontrado"
            }, { status: 404 });
        }

        // Transformar times de objetos para array de strings
        const formattedSchedules = dateSchedules.map(schedule => ({
            ...schedule,
            times: schedule.times.map(t => t.time),
        }));

        console.log('✅ Agendamentos encontrados:', formattedSchedules.length);

        return NextResponse.json(formattedSchedules);

    } catch (error) {
        console.error("❌ Erro:", error);
        return NextResponse.json({
            error: "Erro ao buscar agendamentos"
        }, { status: 500 });
    }
}