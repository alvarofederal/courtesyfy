import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        error: "Não autorizado"
      }, {
        status: 401
      });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');
    const typeServiceId = searchParams.get('typeServiceId');

    console.log('🔍 Verificando agendamentos:', { userId, date, typeServiceId });

    if (!userId || !date || !typeServiceId) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const appointmentsCount = await prisma.appointment.count({
      where: {
        userId,
        appointmentDate: new Date(date),
        typeServiceId,
      },
    });

    console.log(`📊 Total de agendamentos encontrados: ${appointmentsCount}`);

    return NextResponse.json({ 
      count: appointmentsCount,
      hasAppointments: appointmentsCount > 0
    });

  } catch (error) {
    console.error('❌ Erro ao verificar agendamentos:', error);
    return NextResponse.json({ error: 'Erro ao verificar agendamentos' }, { status: 500 });
  }
}
