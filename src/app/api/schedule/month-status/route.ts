// src/app/api/schedule/month-status/route.ts - SUBSTITUIR COMPLETO
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { slotsRequiredFor } from "@/lib/scheduling"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    if (!userId || !startDate || !endDate) {
        return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    try {
        console.log("🔍 [month-status] Buscando status do mês:", { userId, startDate, endDate })

        // Buscar todos os slots disponibilizados no período
        const availableSlots = await prisma.availableSlot.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(startDate + 'T00:00:00Z'),
                    lte: new Date(endDate + 'T23:59:59Z')
                }
            },
            select: {
                date: true,
                times: {
                    select: {
                        time: true
                    }
                }
            }
        })

        console.log("📅 [month-status] Slots encontrados:", availableSlots.length)

        // ✅ CORRIGIDO - Buscar appointments COM service para calcular duração
        const appointments = await prisma.appointment.findMany({
            where: {
                userId,
                appointmentDate: {
                    gte: new Date(startDate + 'T00:00:00Z'),
                    lte: new Date(endDate + 'T23:59:59Z')
                }
            },
            select: {
                appointmentDate: true,
                typeService: {
                    select: {
                        duration: true
                    }
                }
            }
        })

        console.log("📋 [month-status] Appointments encontrados:", appointments.length)

        // Agrupar por data
        const dateStatusMap: Record<string, { total: number, booked: number, status: 'empty' | 'partial' | 'full' }> = {}

        // Contar slots disponíveis por data
        availableSlots.forEach(slot => {
            const dateKey = slot.date.toISOString().split('T')[0]
            if (!dateStatusMap[dateKey]) {
                dateStatusMap[dateKey] = { total: 0, booked: 0, status: 'empty' }
            }
            // Contar quantos times tem neste slot
            dateStatusMap[dateKey].total += slot.times.length
        })

        // ✅ CORRIGIDO - Contar SLOTS OCUPADOS (não apenas appointments)
        appointments.forEach(apt => {
            const dateKey = apt.appointmentDate.toISOString().split('T')[0]
            if (dateStatusMap[dateKey]) {
                const duration = apt.typeService?.duration ?? 0
                const slotsOccupied = slotsRequiredFor(duration)
                
                dateStatusMap[dateKey].booked += slotsOccupied
                
                console.log(`📊 [month-status] ${dateKey}: Appointment com ${duration}min ocupa ${slotsOccupied} slots`)
            }
        })

        // Calcular status
        Object.keys(dateStatusMap).forEach(dateKey => {
            const { total, booked } = dateStatusMap[dateKey]
            
            console.log(`📊 [month-status] ${dateKey}: ${booked}/${total} slots`)
            
            if (booked === 0) {
                dateStatusMap[dateKey].status = 'empty' // Verde
            } else if (booked < total) {
                dateStatusMap[dateKey].status = 'partial' // Amarelo
            } else {
                dateStatusMap[dateKey].status = 'full' // Vermelho
            }
        })

        console.log("✅ [month-status] Status final:", dateStatusMap)

        return NextResponse.json(dateStatusMap)
    } catch (error) {
        console.error("❌ [month-status] Erro:", error)
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }
}