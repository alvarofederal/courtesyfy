// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const planFilter = searchParams.get('plan') || 'all';

    // ✅ DEBUG: Ver o que está chegando
    console.log('🔍 Filtros recebidos:', {
      page,
      limit,
      search,
      statusFilter,
      planFilter,
    });

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    // Filtro de busca
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // ✅ Filtro de status COM LOG
    if (statusFilter !== 'all') {
      const statusBoolean = statusFilter === 'true';
      where.status = statusBoolean;
      console.log('✅ Aplicando filtro de status:', { statusFilter, statusBoolean });
    } else {
      console.log('⚠️ Mostrando TODOS os status (sem filtro)');
    }

    // Filtro de plano
    if (planFilter !== 'all') {
      where.subscription = {
        plan: planFilter,
      };
    }

    console.log('📊 WHERE final:', JSON.stringify(where, null, 2));

    // Buscar usuários
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          image: true,
          subscription: {
            select: {
              plan: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    console.log(`✅ Encontrados ${total} usuários`);
    console.log('📋 Usuários:', users.map(u => ({ name: u.name, status: u.status })));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}