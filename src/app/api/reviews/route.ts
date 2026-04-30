// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { z } from "zod"

const reviewSchema = z.object({
  professionalId: z.string(),
  patientName: z.string().min(2, "Nome muito curto"),
  patientEmail: z.string().email("Email inválido"),
  patientPhone: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comentário muito curto (mínimo 10 caracteres)"),
  appointmentId: z.string().optional(),
})

// ✅ Criar nova avaliação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = reviewSchema.parse(body)

    // Verificar se o profissional existe e está ativo
    const professional = await prisma.user.findUnique({
      where: { 
        id: data.professionalId,
        status: true,
      }
    })

    if (!professional) {
      return NextResponse.json(
        { error: "Profissional não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se já existe review para este appointment
    if (data.appointmentId) {
      const existingReview = await prisma.review.findUnique({
        where: { appointmentId: data.appointmentId }
      })

      if (existingReview) {
        return NextResponse.json(
          { error: "Este agendamento já foi avaliado" },
          { status: 400 }
        )
      }
    }

    // Criar review
    const review = await prisma.review.create({
      data: {
        professionalId: data.professionalId,
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        patientPhone: data.patientPhone,
        rating: data.rating,
        comment: data.comment,
        appointmentId: data.appointmentId,
        status: "PENDING", // Aguardando moderação
      },
      include: {
        professional: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Erro ao criar review:", error)
    return NextResponse.json(
      { error: "Erro ao criar avaliação" },
      { status: 500 }
    )
  }
}

// ✅ Listar reviews APROVADAS de um profissional
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const professionalId = searchParams.get("professionalId")

    if (!professionalId) {
      return NextResponse.json(
        { error: "professionalId é obrigatório" },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: {
        professionalId,
        status: "APPROVED", // Apenas aprovadas
      },
      include: {
        likes: true,
        professional: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: [
        { createdAt: "desc" }
      ]
    })

    // Calcular estatísticas
    const stats = {
      total: reviews.length,
      averageRating: reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      }
    }

    return NextResponse.json({ reviews, stats })
  } catch (error) {
    console.error("Erro ao buscar reviews:", error)
    return NextResponse.json(
      { error: "Erro ao buscar avaliações" },
      { status: 500 }
    )
  }
}