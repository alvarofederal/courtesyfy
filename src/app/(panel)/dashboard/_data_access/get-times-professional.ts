"use server"

import prisma from "@/lib/prisma"

export async function getTimesProfessional({userId}: { userId: string }) {

    if (!userId) {
        return {
            times: [],
            userId: "",
        }
    }

    try {
        const user = await prisma.availableSlot.findFirst({
            where: {
                id: userId,
            },
            select: {
                id: true,
                times: true,
            }
        })

        if (!user) {
            return {
                times: [],
                userId: "",
            }
        }

        return {
            times: user.times,
            userId: user.id,
        }

        console.log(user)

    } catch (error) {
                return {
            times: [],
            userId: "",
        }
    }
}