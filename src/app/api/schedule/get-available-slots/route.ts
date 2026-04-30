import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const userId = searchParams.get('userId')
    const dateString = searchParams.get('date')
    const address = searchParams.get('address')
    const typeServiceId = searchParams.get('typeServiceId')

    console.log('🔍 Buscando slots:', { 
      userId, 
      dateString, 
      dateUTC: new Date(dateString + 'T00:00:00.000Z').toISOString(),
      address, 
      typeServiceId
    })

    if (!userId || !dateString || !address || !typeServiceId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const dateUTC = new Date(dateString + 'T00:00:00.000Z')

    const availableSlot = await prisma.availableSlot.findFirst({
      where: {
        userId,
        date: dateUTC,
        address,
        typeServiceId,
        status: 'AVAILABLE',
      },
      include: {
        times: {
          orderBy: {
            time: 'asc'
          }
        }
      }
    })

    if (!availableSlot) {
      return NextResponse.json([])
    }

    const timeSlots = availableSlot.times.map(t => ({
      time: t.time,
      available: true
    }))

    return NextResponse.json(timeSlots)
  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}