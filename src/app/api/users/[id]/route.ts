// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Autenticação
    const session = await auth()
    
    if (!session?.user?.id) {
      redirect("/")
    }

    const { id } = await context.params

    // ✅ PERMITIR: Próprio usuário OU Admin
    const canAccess = session.user.id === id || session.user.role === 'ADMIN'
    
    if (!canAccess) {
      return NextResponse.json(
        { error: 'Acesso negado' }, 
        { status: 403 }
      )
    }

    // ✅ BUSCAR USUÁRIO COM ADDRESSES E TIMES
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        addresses: true,  // ✅ INCLUIR
        times: true,      // ✅ INCLUIR
        profession: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' }, 
        { status: 404 }
      )
    }

    console.log("✅ Usuário encontrado:", {
      userId: user.id,
      addressesCount: user.addresses?.length || 0,
      addresses: user.addresses?.map(a => a.address) || []
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    )
  }
}

// PUT - Atualizar usuário
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      redirect("/")
    }

    const { id } = await context.params

    // ✅ VERIFICAR SE É ADMIN (apenas admin pode atualizar via API)
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' }, 
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, email, phone, status } = body

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        status,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' }, 
      { status: 500 }
    )
  }
}

// DELETE - Deletar usuário
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      redirect("/")
    }

    const { id } = await context.params

    // ✅ VERIFICAR SE É ADMIN
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' }, 
        { status: 403 }
      )
    }

    // ✅ NÃO PERMITIR DELETAR A SI MESMO
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Você não pode deletar sua própria conta' }, 
        { status: 400 }
      )
    }

    // 🎁 Anti-fraude balanceada: a eligibility so persiste (com userId=null
    // via SetNull) se a cortesia foi APROVADA — ai trava o email pra sempre.
    // Estados sem premio efetivo (PENDING/ELIGIBLE/EXPIRED/REJECTED) sao
    // apagados junto com o user, permitindo retentar com mesmo email.
    const eligibility = await prisma.courtesyEligibility.findUnique({
      where: { userId: id },
      select: { id: true, status: true },
    })
    const { recordCourtesyAudit } = await import("@/lib/courtesy-audit")
    if (eligibility) {
      if (eligibility.status !== "APPROVED") {
        await prisma.courtesyEligibility.delete({
          where: { id: eligibility.id },
        })
        await recordCourtesyAudit("user.deleted_with_eligibility_removed", {
          eligibilityId: eligibility.id,
          message: `User ${id} deletado, eligibility (status=${eligibility.status}) removida pra liberar retentativa`,
        })
      } else {
        await recordCourtesyAudit("user.deleted_with_eligibility_kept", {
          eligibilityId: eligibility.id,
          message: `User ${id} deletado, eligibility APPROVED preservada (anti-fraude). userId vai virar null via SetNull.`,
        })
      }
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar usuário' }, 
      { status: 500 }
    )
  }
}