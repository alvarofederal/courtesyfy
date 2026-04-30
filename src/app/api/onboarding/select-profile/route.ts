// src/app/api/onboarding/select-profile/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { typeProfile } = await request.json()

    if (!typeProfile || !["TOTAL", "INFO", "WAITLIST"].includes(typeProfile)) {
      return NextResponse.json(
        { error: "Tipo de perfil inválido" },
        { status: 400 }
      )
    }

    // ✅ Buscar sessão JWT
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // ✅ Atualizar usuário
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        typeProfile,
        role: "USER",
      }
    })

    console.log("✅ Perfil selecionado:", session.user.id, typeProfile)

    return NextResponse.json({
      success: true,
      message: "Perfil selecionado com sucesso!"
    })

  } catch (error) {
    console.error("❌ Erro ao selecionar perfil:", error)
    return NextResponse.json(
      { error: "Erro ao selecionar perfil" },
      { status: 500 }
    )
  }
}