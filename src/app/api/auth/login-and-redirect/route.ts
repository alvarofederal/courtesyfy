export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true, emailVerified: true },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Email não verificado", code: "EMAIL_NOT_VERIFIED" },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 }
      )
    }

    await prisma.session.deleteMany({ where: { userId: user.id } })

    const sessionToken = crypto.randomUUID()
    const expires = new Date()
    expires.setDate(expires.getDate() + 30)

    await prisma.session.create({
      data: { sessionToken, userId: user.id, expires },
    })

    const response = NextResponse.json({ success: true, redirectTo: "/dashboard" })

    const cookieName =
      process.env.NODE_ENV === "production"
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

    return response
  } catch (error) {
    console.error("Erro no login:", error)
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 })
  }
}
