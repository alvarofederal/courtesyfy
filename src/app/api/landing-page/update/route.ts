import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { heroTitle, heroSubtitle, heroImage } = await req.json();

    if (!heroTitle || !heroSubtitle) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // ✅ Corrigido: landingPage
    const existing = await prisma.landingPage.findFirst();

    let content;

    if (existing) {
      content = await prisma.landingPage.update({
        where: { id: existing.id },
        data: {
          heroTitle,
          heroSubtitle,
          heroImage,
        },
      });
    } else {
      content = await prisma.landingPage.create({
        data: {
          heroTitle,
          heroSubtitle,
          heroImage,
        },
      });
    }

    console.log('✅ Conteúdo da landing page atualizado');

    revalidatePath('/');
    
    return NextResponse.json({ success: true, content });

  } catch (error) {
    console.error('❌ Erro ao atualizar landing page:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}