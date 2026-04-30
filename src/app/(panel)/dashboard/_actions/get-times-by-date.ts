"use server"

import prisma from "@/lib/prisma"

export async function getTimesByDate({ 
  userId, 
  date 
}: { 
  userId: string;
  date: string;
}) {
  if (!userId || !date) {
    return {
      times: [],
      userId: "",
    }
  }

  try {
    const [year, month, day] = date.split("-").map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

    console.log('🔍 Buscando horários para:', {
      userId,
      date,
      targetDate
    });

    const availableSlots = await prisma.availableSlot.findMany({
      where: {
        userId: userId,
        date: targetDate,
        status: 'AVAILABLE',
      },
      include: {
        times: {
          orderBy: {
            time: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc',
      }
    });

    if (!availableSlots || availableSlots.length === 0) {
      console.log('📭 Nenhum horário disponibilizado para esta data');
      return {
        times: [],
        userId: userId,
      }
    }

    const allTimes = new Set<string>();
    
    availableSlots.forEach(slot => {
      slot.times.forEach(timeObj => {
        allTimes.add(timeObj.time);
      });
    });

    const sortedTimes = Array.from(allTimes).sort();

    console.log('✅ Horários encontrados:', {
      slotsCount: availableSlots.length,
      totalTimes: sortedTimes.length,
      times: sortedTimes
    });

    return {
      times: sortedTimes,
      userId: userId,
    }

  } catch (error) {
    console.error('❌ Erro ao buscar horários:', error);
    return {
      times: [],
      userId: "",
    }
  }
}