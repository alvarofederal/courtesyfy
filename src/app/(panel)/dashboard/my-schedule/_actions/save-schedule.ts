'use server'

import { Appointment } from '@/generated/prisma';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SLOT_INTERVAL_MINUTES } from '@/lib/scheduling';


export async function saveSchedule(formData: FormData) {
    const date = formData.get('date') as string;
    const address = formData.get('address') as string;
    const slots = JSON.parse(formData.get('slots') as string); // Array de horários
    const userId = formData.get('userId') as string;
    const typeServiceId = formData.get('typeServiceId') as string;

    if (!typeServiceId) {
        return { error: 'Tipo de atendimento é obrigatório' };
    }

    try {
        for (const time of slots) {
            const startTime = new Date(`${date}T${time}`);
            const endTime = new Date(startTime.getTime() + SLOT_INTERVAL_MINUTES * 60 * 1000);

            const appointmentData = {
                startTime,
                endTime,
                address,
                appointmentDate: startTime, // Usa startTime
                time, // String do horário
                name: 'Open Slot', // Placeholder para open
                email: 'open@agenda.com', // Placeholder (required)
                phone: '0000-0000', // Placeholder (required)
                typeServiceId: typeServiceId,  // Empty string instead of undefined
                userId, // Required string, sem undefined
                confirmed: false,
                source: "DASHBOARD" as const,
            };

            await prisma.appointment.create({
                data: appointmentData,
            });
        }
        revalidatePath('/dashboard/agenda');
        return { data: 'Agenda salva!' };
    } catch (err) {
        console.error('Erro no save:', err);
        return { error: 'Erro ao salvar agenda' };
    }
}