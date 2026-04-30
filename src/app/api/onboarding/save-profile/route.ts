import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
      return NextResponse.json({
        error: "Não autorizado"
      }, {
        status: 401
      });
    }

    const { typeProfile } = await req.json();

    if (!typeProfile || !['TOTAL', 'INFO', 'WAITLIST'].includes(typeProfile)) {
      return NextResponse.json({ error: 'Tipo de perfil inválido' }, { status: 400 });
    }

    console.log('💾 Salvando perfil:', { userId: session.user.id, typeProfile });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { typeProfile },
    });

    console.log('✅ Perfil salvo com sucesso');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Erro ao salvar perfil:', error);
    return NextResponse.json({ error: 'Erro ao salvar perfil' }, { status: 500 });
  }
}