import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, date, address, typeServiceId, slots } = body;

        if (!userId || !date || !address || !typeServiceId || !slots || slots.length === 0) {
            return NextResponse.json(
                { message: 'Dados incompletos' },
                { status: 400 }
            );
        }

        const dateObj = new Date(date);

        const existingSlot = await prisma.availableSlot.findFirst({
            where: {
                userId,
                date: dateObj,
                address,
                typeServiceId,
            },
        });

        if (existingSlot) {
            await prisma.availableSlotTime.deleteMany({
                where: {
                    availableSlotId: existingSlot.id,
                },
            });

            await prisma.availableSlotTime.createMany({
                data: slots.map((time: string) => ({
                    availableSlotId: existingSlot.id,
                    time: time,
                })),
            });

            await prisma.availableSlot.update({
                where: { id: existingSlot.id },
                data: {
                    status: 'AVAILABLE',
                },
            });

            return NextResponse.json({
                message: 'Agenda atualizada com sucesso',
                slot: existingSlot,
            });
        }

        const newSlot = await prisma.availableSlot.create({
            data: {
                userId,
                date: dateObj,
                address,
                typeServiceId,
                status: 'AVAILABLE',
                times: {
                    create: slots.map((time: string) => ({
                        time: time,
                    })),
                },
            },
        });

        return NextResponse.json({
            message: 'Agenda criada com sucesso',
            slot: newSlot,
        });

    } catch (error) {
        console.error('Erro ao salvar agenda:', error);
        return NextResponse.json(
            { message: 'Erro ao salvar agenda' },
            { status: 500 }
        );
    }
}