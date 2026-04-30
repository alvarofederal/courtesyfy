import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
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
        const typeServiceIdParam = searchParams.get('typeServiceId');

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

        if (!dateParam || !addressParam || !typeServiceIdParam) {
            return NextResponse.json({
                error: "Parâmetros incompletos. Necessário: date, address, typeServiceId"
            }, {
                status: 400
            });
        }

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
            typeServiceId: typeServiceIdParam
        });

        const existingSchedule = await prisma.availableSlot.findFirst({
            where: {
                userId: session.user.id,
                date: targetDate,
                address: addressParam,
                typeServiceId: typeServiceIdParam,
                status: 'AVAILABLE',
            },
            include: {
                times: {
                    orderBy: {
                        time: 'asc'
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
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

        const formattedSchedule = {
            ...existingSchedule,
            times: existingSchedule.times.map(t => t.time)
        };

        console.log('✅ Agenda encontrada:', {
            id: formattedSchedule.id,
            timesCount: formattedSchedule.times.length,
            times: formattedSchedule.times
        });

        return NextResponse.json(formattedSchedule);

    } catch (error) {
        console.error("❌ Erro ao buscar agenda existente:", error);
        return NextResponse.json({
            error: "Erro ao buscar agenda"
        }, {
            status: 500
        });
    }
}