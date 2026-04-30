// src/app/api/onboarding/select-profile/route.ts
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function POST(request: NextRequest) {
  try {
    // ✅ Autenticação
    const session = await auth()
    
    if (!session?.user?.id) {
      redirect("/login")
    }

    const body = await request.json()
    const { typeProfile } = body

    // ✅ Validar typeProfile
    if (!typeProfile || !["TOTAL", "INFO", "WAITLIST"].includes(typeProfile)) {
      return NextResponse.json(
        { error: "Tipo de perfil inválido" },
        { status: 400 }
      )
    }

    // ✅ Verificar se usuário existe e email verificado
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailVerified: true,
        typeProfile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Email não verificado" },
        { status: 400 }
      )
    }

    // ✅ Atualizar typeProfile e role
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        typeProfile: typeProfile,
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