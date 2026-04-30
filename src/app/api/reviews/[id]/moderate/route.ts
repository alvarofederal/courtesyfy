// src/app/api/reviews/[id]/moderate/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth";


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticação
    const session = await auth();
    
    if (!session || !session.user?.id) {
        return NextResponse.json({
            error: "Não autorizado"
        }, {
            status: 401
        });
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body // 'approve' ou 'reject'

    // Verificar se o review pertence ao profissional
    const review = await prisma.review.findUnique({
      where: { id }
    })

    if (!review || review.professionalId !== session.user.id) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      )
    }

    // Atualizar status
    const updated = await prisma.review.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED'
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro ao moderar review:", error)
    return NextResponse.json(
      { error: "Erro ao moderar avaliação" },
      { status: 500 }
    )
  }
}