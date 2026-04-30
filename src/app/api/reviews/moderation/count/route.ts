// src/app/api/reviews/moderation/count/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user?.id) {
        return NextResponse.json({
            error: "Não autorizado"
        }, {
            status: 401
        });
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ pending: 0 })
    }

    const pending = await prisma.review.count({
      where: {
        professionalId: userId,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ pending })
  } catch (error) {
    console.error("Erro ao contar reviews:", error)
    return NextResponse.json({ pending: 0 })
  }
}