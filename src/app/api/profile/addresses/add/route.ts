// src/app/api/profile/addresses/add/route.ts (EXEMPLO)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { addressAlreadyExists } from '@/lib/validate-addresses';

/**
 * POST /api/profile/addresses/add
 * Adiciona novo endereço ao perfil do usuário
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // 2. Obter dados
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Endereço inválido' },
        { status: 400 }
      );
    }

    const trimmed = address.trim();

    if (trimmed.length === 0) {
      return NextResponse.json(
        { error: 'Endereço não pode ser vazio' },
        { status: 400 }
      );
    }

    // 3. VALIDAÇÃO: Verificar se já existe
    const exists = await addressAlreadyExists(session.user.id, trimmed);

    if (exists) {
      return NextResponse.json(
        { error: 'Este endereço já está cadastrado' },
        { status: 400 }
      );
    }

    // 4. Salvar
    const newAddress = await prisma.userAddress.create({
      data: {
        userId: session.user.id,
        address: trimmed,
      },
    });

    console.log('✅ Endereço adicionado:', newAddress.id);

    return NextResponse.json({
      success: true,
      address: newAddress,
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar endereço:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar endereço' },
      { status: 500 }
    );
  }
}