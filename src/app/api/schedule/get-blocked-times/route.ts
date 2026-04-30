// src/app/api/schedule/get-blocked-times/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { SLOT_INTERVAL_MINUTES, slotsRequiredFor } from '@/lib/scheduling'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const userId = searchParams.get('userId')
    const dateString = searchParams.get('date')
    const address = searchParams.get('address')
    const typeServiceId = searchParams.get('typeServiceId') // 🔥 RECEBE typeServiceId mas usa como typeServiceId

    if (!userId || !dateString || !address || !typeServiceId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const startUTC = new Date(dateString + 'T00:00:00.000Z')
    const endUTC = new Date(dateString + 'T23:59:59.999Z')

    console.log('🔍 Buscando bloqueios:', { 
      userId, 
      dateString, 
      startUTC: startUTC.toISOString(),
      endUTC: endUTC.toISOString()
    })

    // 🔥 CORRIGIDO: typeServiceId em vez de typeServiceId
    const appointments = await prisma.appointment.findMany({
      where: {
        userId,
        appointmentDate: {
          gte: startUTC,
          lte: endUTC
        },
        address,
        typeServiceId,  // ✅ CORRETO
        confirmed: true,
      },
      include: {
        typeService: {  // ✅ CORRETO: typeService em vez de service
          select: {
            duration: true
          }
        }
      }
    })

    const blockedTimes: string[] = []

    appointments.forEach((appointment) => {
      const appointmentTime = appointment.time
      const duration = appointment.typeService.duration ?? 0
      const slots = slotsRequiredFor(duration)

      const [hours, minutes] = appointmentTime.split(':').map(Number)
      let totalMinutes = hours * 60 + minutes

      for (let i = 0; i < slots; i++) {
        const h = Math.floor(totalMinutes / 60)
        const m = totalMinutes % 60
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
        blockedTimes.push(timeStr)
        totalMinutes += SLOT_INTERVAL_MINUTES
      }
    })

    return NextResponse.json(blockedTimes)
  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}