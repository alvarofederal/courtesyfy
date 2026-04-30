import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const content = await prisma.landingPage.findFirst({
      orderBy: { updatedAt: 'desc' }
    });

    console.log('📦 API retornando conteúdo:', {
      hasContent: !!content,
      heroImage: content?.heroImage,
      heroTitle: content?.heroTitle?.substring(0, 30) + '...',
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('❌ Erro ao buscar conteúdo:', error);
    return NextResponse.json({ content: null }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;