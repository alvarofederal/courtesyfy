// src/app/api/auth/login-and-redirect/route.ts
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 1. Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        emailVerified: true,
        typeProfile: true,
        name: true,
        cpf: true,
        phone: true,
        professionId: true,
        registration: true,
      }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    // 2. Verificar email
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Email não verificado", code: "EMAIL_NOT_VERIFIED" },
        { status: 401 }
      )
    }

    // 3. Verificar senha
    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    // ✅ 4. DELETAR sessões antigas do usuário
    await prisma.session.deleteMany({
      where: { userId: user.id }
    })

    // ✅ 5. Criar nova sessão NO BANCO
    const sessionToken = crypto.randomUUID()
    const expires = new Date()
    expires.setDate(expires.getDate() + 30)

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      }
    })

    // 6. Determinar redirect
    let redirectTo = "/dashboard"

    if (!user.typeProfile) {
      redirectTo = "/onboarding/select-profile"
    } else if (!user.name || !user.cpf || !user.phone || !user.professionId || !user.registration) {
      redirectTo = "/onboarding/complete-profile"
    }

    console.log("✅ Login bem-sucedido:", email, "→", redirectTo)
    console.log("🎫 Session criada:", sessionToken)

    // ✅ 7. Setar cookie com nome correto
    const response = NextResponse.json({
      success: true,
      redirectTo,
    })

    // Nome do cookie DEVE ser exatamente este
    const cookieName = process.env.NODE_ENV === "production" 
      ? "__Secure-authjs.session-token"
      : "authjs.session-token"

    response.cookies.set({
      name: cookieName,
      value: sessionToken,
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    })

    console.log("🍪 Cookie setado:", cookieName)

    return response

  } catch (error) {
    console.error("❌ Erro no login:", error)
    return NextResponse.json(
      { error: "Erro ao fazer login" },
      { status: 500 }
    )
  }
}