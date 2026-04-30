// src/app/api/reviews/moderation/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth";


export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") as 'PENDING' | 'APPROVED' | 'REJECTED' | null
    const userId = searchParams.get("userId")

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        professionalId: userId,
        ...(status && { status })
      },
      include: {
        likes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Estatísticas
    const stats = await prisma.review.groupBy({
      by: ['status'],
      where: {
        professionalId: userId
      },
      _count: true
    })

    const statsFormatted = {
      pending: stats.find(s => s.status === 'PENDING')?._count || 0,
      approved: stats.find(s => s.status === 'APPROVED')?._count || 0,
      rejected: stats.find(s => s.status === 'REJECTED')?._count || 0,
    }

    return NextResponse.json({ reviews, stats: statsFormatted })
  } catch (error) {
    console.error("Erro ao buscar reviews:", error)
    return NextResponse.json(
      { error: "Erro ao buscar avaliações" },
      { status: 500 }
    )
  }
}