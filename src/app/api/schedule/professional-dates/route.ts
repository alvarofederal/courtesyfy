// src/app/api/schedule/professional-dates/route.ts - CRIAR NOVO ARQUIVO
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    if (!userId || !startDate || !endDate) {
        return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    try {
        // Buscar todas as datas com slots disponibilizados
        const availableSlots = await prisma.availableSlot.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(startDate + 'T00:00:00Z'),
                    lte: new Date(endDate + 'T23:59:59Z')
                }
            },
            select: {
                date: true
            },
            distinct: ['date']
        })

        // Retornar array de datas em formato ISO
        const dates = availableSlots.map(slot => slot.date.toISOString().split('T')[0])
        
        return NextResponse.json(dates)
    } catch (error) {
        console.error("❌ [professional-dates] Erro:", error)
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }
}