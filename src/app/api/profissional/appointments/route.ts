import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth"; // ou getServerSession

/**
 * GET /api/professional/appointments
 * 
 * Retorna agendamentos do profissional para uma data específica
 * Usado no painel do profissional para ver seus agendamentos
 */
export async function GET(request: NextRequest) {
    try {
        // Autenticação
        const session = await auth();
        
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

        // Validar que userId é o mesmo da sessão
        if (!userId || userId !== session.user.id) {
            return NextResponse.json({
                error: "Acesso negado"
            }, {
                status: 403
            });
        }

        if (!dateParam) {
            return NextResponse.json({
                error: "Data é obrigatória"
            }, {
                status: 400
            });
        }

        // Parse data
        const [year, month, day] = dateParam.split("-").map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return NextResponse.json({
                error: "Data inválida"
            }, {
                status: 400
            });
        }

        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        console.log('🔍 Buscando agendamentos:', {
            userId: session.user.id,
            date: dateParam
        });

        // Buscar appointments do profissional na data
        const appointments = await prisma.appointment.findMany({
            where: {
                userId: session.user.id,
                appointmentDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                typeService: true,
            },
            orderBy: {
                time: 'asc',
            },
        });

        console.log('✅ Agendamentos encontrados:', appointments.length);

        return NextResponse.json(appointments);

    } catch (error) {
        console.error("❌ Erro ao buscar agendamentos:", error);
        return NextResponse.json({
            error: "Erro ao buscar agendamentos"
        }, {
            status: 500
        });
    }
}