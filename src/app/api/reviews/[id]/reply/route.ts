// src/app/api/reviews/[id]/reply/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Autenticação
    const session = await auth();
    
    // ✅ USAR redirect() ao invés de NextResponse
    if (!session?.user?.id) {
      redirect("/")
    }

    const { id } = await context.params
    const body = await request.json()
    const { reply } = body

    if (!reply || reply.trim().length < 10) {
      return NextResponse.json(
        { error: "Resposta muito curta (mínimo 10 caracteres)" },
        { status: 400 }
      )
    }

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

    // Atualizar resposta
    const updated = await prisma.review.update({
      where: { id },
      data: {
        professionalReply: reply,
        repliedAt: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Erro ao responder review:", error)
    return NextResponse.json(
      { error: "Erro ao responder avaliação" },
      { status: 500 }
    )
  }
}
