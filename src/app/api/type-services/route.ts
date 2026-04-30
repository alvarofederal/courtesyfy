import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 });
    }

    try {
        const userTypeServices = await prisma.userTypeService.findMany({
            where: {
                userId,
                active: true,
            },
            include: {
                typeService: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        duration: true,
                        status: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const typeServices = userTypeServices.map(uts => ({
            id: uts.typeService.id,
            name: uts.typeService.name,
            description: uts.typeService.description,
            duration: uts.typeService.duration,
        }));

        return NextResponse.json(typeServices);
    } catch (error) {
        console.error('Erro ao buscar tipos de atendimento:', error);
        return NextResponse.json({ error: 'Erro ao buscar tipos de atendimento' }, { status: 500 });
    }
}