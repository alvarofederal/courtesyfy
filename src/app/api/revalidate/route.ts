import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { path } = await req.json();

    // Revalidar a página
    revalidatePath(path || '/');

    console.log(`✅ Cache revalidado para: ${path || '/'}`);

    return NextResponse.json({ 
      success: true, 
      revalidated: true,
      timestamp: new Date().toISOString() 
    });

  } catch (error) {
    console.error('❌ Erro ao revalidar:', error);
    return NextResponse.json({ error: 'Erro ao revalidar' }, { status: 500 });
  }
}