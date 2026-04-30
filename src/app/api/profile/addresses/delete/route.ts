// src/app/api/profile/addresses/delete/route.ts (EXEMPLO)

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { addressHasAppointments } from '@/lib/validate-addresses';

/**
 * DELETE /api/profile/addresses/delete
 * Remove endereço do perfil do usuário (apenas se não tiver agendamentos)
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // 2. Obter dados (pode ser addressId ou address string)
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');
    const addressString = searchParams.get('address');

    if (!addressId && !addressString) {
      return NextResponse.json(
        { error: 'Endereço não especificado' },
        { status: 400 }
      );
    }

    // 3. Buscar endereço no banco
    let addressRecord;
    if (addressId) {
      addressRecord = await prisma.userAddress.findFirst({
        where: {
          id: addressId,
          userId: session.user.id, // Segurança: só pode deletar próprio endereço
        },
      });
    } else {
      addressRecord = await prisma.userAddress.findFirst({
        where: {
          address: addressString!.trim(),
          userId: session.user.id,
        },
      });
    }

    if (!addressRecord) {
      return NextResponse.json(
        { error: 'Endereço não encontrado' },
        { status: 404 }
      );
    }

    // 4. VALIDAÇÃO CRÍTICA: Verificar se tem agendamentos
    const validation = await addressHasAppointments(
      session.user.id,
      addressRecord.address
    );

    if (!validation.canDelete) {
      console.warn('⚠️ Tentativa de deletar endereço com agendamentos:', {
        address: addressRecord.address,
        availableSlots: validation.availableSlotsCount,
        appointments: validation.appointmentsCount,
      });

      return NextResponse.json(
        { 
          error: validation.message,
          details: {
            availableSlotsCount: validation.availableSlotsCount,
            appointmentsCount: validation.appointmentsCount,
          }
        },
        { status: 400 }
      );
    }

    // 5. Deletar (só se passou na validação)
    await prisma.userAddress.delete({
      where: { id: addressRecord.id },
    });

    console.log('✅ Endereço deletado:', addressRecord.id);

    return NextResponse.json({
      success: true,
      message: 'Endereço removido com sucesso',
    });

  } catch (error) {
    console.error('❌ Erro ao deletar endereço:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar endereço' },
      { status: 500 }
    );
  }
}