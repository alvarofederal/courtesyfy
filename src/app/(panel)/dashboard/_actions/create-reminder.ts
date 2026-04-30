"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"

const imageSchema = z.object({
    url: z.string().url(),
    publicId: z.string().nullable().optional(),
})

const formSchema = z.object({
    appointmentId: z.string().min(1, "Agendamento obrigatório"),
    title: z.string().min(1, "O título é obrigatório").max(120),
    description: z.string().min(1, "A descrição é obrigatória").max(500),
    expiresAt: z.coerce.date(),
    images: z.array(imageSchema).max(2).optional(),
})

type FormSchema = z.infer<typeof formSchema>

export async function createReminder(formData: FormSchema) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Falha ao cadastrar lembrete." }
    }

    const schema = formSchema.safeParse(formData)
    if (!schema.success) {
        return { error: schema.error.issues[0].message }
    }

    const appointment = await prisma.appointment.findUnique({
        where: { id: formData.appointmentId },
        select: { userId: true },
    })

    if (!appointment || appointment.userId !== session.user.id) {
        return { error: "Agendamento inválido." }
    }

    try {
        await prisma.reminder.create({
            data: {
                title: formData.title,
                description: formData.description,
                expiresAt: formData.expiresAt,
                images: formData.images ?? [],
                appointmentId: formData.appointmentId,
                userId: session.user.id,
            },
        })

        revalidatePath("/dashboard/appointments")

        return { data: "Lembrete criado com sucesso" }
    } catch (error) {
        return { error: "Não foi possível criar o lembrete." }
    }
}
