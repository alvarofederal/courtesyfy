"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/lib/auth"

const formSchema = z.object({
    reminderId: z.string().min(1, "O id do lembrete é obrigatório"),
})

type FormSchema = z.infer<typeof formSchema>

export async function deleteReminder(formData: FormSchema) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Não autorizado" }
    }

    const schema = formSchema.safeParse(formData)
    if (!schema.success) {
        return { error: schema.error.issues[0].message }
    }

    const reminder = await prisma.reminder.findUnique({
        where: { id: formData.reminderId },
        select: { userId: true },
    })

    if (!reminder || reminder.userId !== session.user.id) {
        return { error: "Lembrete não encontrado." }
    }

    try {
        await prisma.reminder.delete({
            where: { id: formData.reminderId },
        })

        revalidatePath("/dashboard/appointments")

        return { data: "Lembrete deletado com sucesso" }
    } catch (error) {
        return { error: "Não foi possível deletar o lembrete." }
    }
}
