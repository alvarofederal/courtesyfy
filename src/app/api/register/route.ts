export const runtime = 'nodejs'

// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"
import { registerSchema } from "@/lib/validators/auth"
import { sendVerificationEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"
import { recordTrackingEvent } from "@/lib/tracking-server"
import { readSessionId } from "@/lib/session-id"
import { recordCourtesyAudit } from "@/lib/courtesy-audit"

const ELIGIBILITY_WINDOW_MS = 48 * 60 * 60 * 1000 // 48h

type LandingHeader = { landing?: string; cta?: string | null }

type LandingHeaderParsed = { landing: string; cta: string | null }

function parseLandingHeader(raw: string | null): LandingHeaderParsed | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as LandingHeader
    if (typeof parsed?.landing !== "string" || !parsed.landing) return null
    return {
      landing: parsed.landing.slice(0, 40),
      cta: parsed.cta ? String(parsed.cta).slice(0, 40) : null,
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // ✅ 1. Rate Limiting (OWASP - Brute Force Protection)
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown"
    
    const { allowed } = await checkRateLimit(`register:${ip}`, 3, 60 * 60 * 1000)
    
    /*if (!allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em 1 hora." },
        { status: 429 }
      )
    }*/

    // ✅ 2. Validar dados
    const body = await request.json()
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // ✅ 3. Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 400 }
      )
    }

    // ✅ 4. Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // ✅ 5. Gerar código de verificação
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // ✅ 6. Criar usuário (SEM role, typeProfile, subscription)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        status: false, // Inativo até verificar email
        // ❌ NÃO criar role
        // ❌ NÃO criar typeProfile
        // ❌ NÃO criar subscription
      }
    })

    // ✅ 7. Criar token de verificação (30 SEGUNDOS)
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + 45) // 45 segundos

    await prisma.authToken.create({
      data: {
        userId: user.id,
        token: verificationCode,
        type: "EMAIL_VERIFICATION",
        expiresAt,
      }
    })

    // ✅ 8. Enviar email
    try {
      await sendVerificationEmail(email, verificationCode, 0.75) // 0.5 minutos = 30 segundos
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError)
      // Não falhar o cadastro se o email falhar
    }

    // ✅ 9. Rastreamento e elegibilidade da cortesia (best-effort, nao falha o cadastro)
    const landingSource = parseLandingHeader(request.headers.get("x-landing-source"))
    const sessionId = readSessionId(request)
    if (landingSource) {
      try {
        // Anti-fraude: 1 cortesia por email pra sempre. Se ja existe
        // eligibility nesse email (mesmo de account anterior deletada),
        // nao cria nova. Cadastro segue normal — usuario fica sem cortesia.
        const existingByEmail = await prisma.courtesyEligibility.findUnique({
          where: { email },
        })
        if (existingByEmail) {
          console.log("[register] email ja teve cortesia, pulando eligibility:", email)
          await recordCourtesyAudit("eligibility.blocked_by_email", {
            eligibilityId: existingByEmail.id,
            email,
            message: `Email ja tem eligibility (status=${existingByEmail.status})`,
            payload: { previousStatus: existingByEmail.status, registerMethod: "email" },
          })
        } else {
          const now = new Date()
          const created = await prisma.courtesyEligibility.create({
            data: {
              userId: user.id,
              email,
              landing: landingSource.landing,
              cta: landingSource.cta,
              sessionId,
              registeredAt: now,
              eligibilityDeadline: new Date(now.getTime() + ELIGIBILITY_WINDOW_MS),
              status: "PENDING_APPOINTMENT",
            },
          })
          await recordCourtesyAudit("eligibility.created", {
            eligibilityId: created.id,
            email,
            message: "Eligibility criada via /api/register (email)",
            payload: { landing: landingSource.landing, cta: landingSource.cta, userId: user.id },
          })
        }
      } catch (err) {
        console.error("[register] failed to create eligibility:", err)
      }
    }

    await recordTrackingEvent({
      event: "landing_conversion",
      landing: landingSource?.landing ?? null,
      cta: landingSource?.cta ?? null,
      method: "email",
      sessionId,
      userId: user.id,
      userAgent: request.headers.get("user-agent"),
    })

    console.log("✅ Usuário criado:", user.id, "Código:", verificationCode)

    return NextResponse.json(
      { 
        success: true,
        message: "Conta criada! Verifique seu email.",
        userId: user.id,
        expiresAt: expiresAt.toISOString()
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("❌ Erro no registro:", error)
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 }
    )
  }
}