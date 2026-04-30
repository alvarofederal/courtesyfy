// src/app/api/user/onboarding-status/route.ts
export const runtime = 'nodejs'

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailVerified: true,
        typeProfile: true,
        name: true,
        cpf: true,
        phone: true,
        professionId: true,
        registration: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    const profileComplete = !!(
      user.name && 
      user.cpf && 
      user.phone && 
      user.professionId && 
      user.registration
    )

    return NextResponse.json({
      emailVerified: !!user.emailVerified,
      typeProfile: user.typeProfile,
      profileComplete,
    })

  } catch (error) {
    console.error("❌ Erro ao verificar onboarding:", error)
    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}