// src/app/api/reviews/[id]/like/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // ✅ Melhor captura de IP
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ip = forwarded?.split(",")[0] || realIp || "unknown"

    const likedByEmail = body.likedByEmail || null
    const likedByFingerprint = body.fingerprint || null // ✅ Fingerprint do frontend

    // Verificar se a review existe
    const review = await prisma.review.findUnique({
      where: { id }
    })

    if (!review) {
      return NextResponse.json(
        { error: "Avaliação não encontrada" },
        { status: 404 }
      )
    }

    // ✅ Verificar se já curtiu (por fingerprint OU email OU IP)
    const existingLike = await prisma.reviewLike.findFirst({
      where: {
        reviewId: id,
        OR: [
          ...(likedByFingerprint ? [{ likedByIp: likedByFingerprint }] : []),
          ...(likedByEmail ? [{ likedByEmail }] : []),
          { likedByIp: ip }
        ]
      }
    })

    if (existingLike) {
      return NextResponse.json(
        { error: "Você já curtiu esta avaliação" },
        { status: 400 }
      )
    }

    // Criar like com fingerprint como identificador principal
    const like = await prisma.reviewLike.create({
      data: {
        reviewId: id,
        likedByEmail,
        likedByIp: likedByFingerprint || ip, // Prioriza fingerprint
      }
    })

    return NextResponse.json({ success: true, like }, { status: 201 })
  } catch (error) {
    console.error("Erro ao curtir review:", error)
    return NextResponse.json(
      { error: "Erro ao curtir avaliação" },
      { status: 500 }
    )
  }
}