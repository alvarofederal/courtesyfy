"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

interface GetRemindersParams {
    appointmentId: string
    includeArchived?: boolean
}

export async function getReminders({ appointmentId, includeArchived = false }: GetRemindersParams) {
    const session = await auth()
    if (!session?.user?.id || !appointmentId) {
        return []
    }

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: { userId: true },
        })

        if (!appointment || appointment.userId !== session.user.id) {
            return []
        }

        // Lazy archiving: marca como arquivado lembretes vencidos
        await prisma.reminder.updateMany({
            where: {
                appointmentId,
                archived: false,
                expiresAt: { lt: new Date() },
            },
            data: { archived: true },
        })

        const reminders = await prisma.reminder.findMany({
            where: {
                appointmentId,
                ...(includeArchived ? {} : { archived: false }),
            },
            orderBy: [{ archived: "asc" }, { createdAt: "desc" }],
        })

        return reminders
    } catch (error) {
        console.log(error)
        return []
    }
}
