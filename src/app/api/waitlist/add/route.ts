import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { professionalId, name, email, phone } = await req.json();

    if (!professionalId || !name || !email || !phone) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Verificar se já está na lista
    const existing = await prisma.waitlist.findFirst({
      where: {
        professionalId,
        email,
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Você já está na lista de espera' }, { status: 400 });
    }

    // Adicionar na lista
    await prisma.waitlist.create({
      data: {
        professionalId,
        name,
        email,
        phone,
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro ao adicionar na waitlist:', error);
    return NextResponse.json({ error: 'Erro ao adicionar na lista de espera' }, { status: 500 });
  }
}