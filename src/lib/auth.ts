// src/lib/auth.ts - ARQUIVO COMPLETO CORRIGIDO

import NextAuth, { DefaultSession, type User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import prisma from './prisma'
import { PrismaAdapter } from "@auth/prisma-adapter"
import type { Adapter, AdapterUser } from "next-auth/adapters"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { generateSlug } from "@/utils/slug/generateSlug"

export const runtime = 'nodejs'

/**
 * Le cookie bm_landing_source e cria CourtesyEligibility + TrackingEvent
 * pra usuario logado via OAuth (vindo de uma landing page).
 * Idempotente: se ja existe eligibility pro user, nao faz nada.
 */
async function tryCreateEligibilityFromCookie(userId: string, method: string) {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const raw = cookieStore.get("bm_landing_source")?.value
    const sessionId = cookieStore.get("bm_sid")?.value ?? null
    if (!raw || !userId) return

    const parsed = JSON.parse(decodeURIComponent(raw)) as {
      landing?: string
      cta?: string | null
    }
    if (!parsed?.landing) return

    const already = await prisma.courtesyEligibility.findUnique({
      where: { userId },
    })
    if (already) {
      console.log("[eligibility] already exists for user:", userId)
      cookieStore.delete("bm_landing_source")
      return
    }

    // Pega o email do user pra anti-fraude por email (mesmo email = 1 cortesia
    // pra sempre, persiste apos delete da conta).
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, role: true },
    })
    if (!userRecord?.email) {
      console.log("[eligibility] user sem email, pulando:", userId)
      cookieStore.delete("bm_landing_source")
      return
    }
    if (userRecord.role === "ADMIN") {
      console.log("[eligibility] user e ADMIN, pulando:", userRecord.email)
      cookieStore.delete("bm_landing_source")
      return
    }

    const existingByEmail = await prisma.courtesyEligibility.findUnique({
      where: { email: userRecord.email },
    })
    if (existingByEmail) {
      console.log("[eligibility] email ja teve cortesia, pulando:", userRecord.email)
      const { recordCourtesyAudit } = await import("@/lib/courtesy-audit")
      await recordCourtesyAudit("eligibility.blocked_by_email", {
        eligibilityId: existingByEmail.id,
        email: userRecord.email,
        message: `Email ja tem eligibility (status=${existingByEmail.status})`,
        payload: { previousStatus: existingByEmail.status, registerMethod: method },
      })
      cookieStore.delete("bm_landing_source")
      return
    }

    const now = new Date()
    const created = await prisma.courtesyEligibility.create({
      data: {
        userId,
        email: userRecord.email,
        landing: parsed.landing.slice(0, 40),
        cta: parsed.cta ? String(parsed.cta).slice(0, 40) : null,
        sessionId,
        registeredAt: now,
        eligibilityDeadline: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: "PENDING_APPOINTMENT",
      },
    })
    {
      const { recordCourtesyAudit } = await import("@/lib/courtesy-audit")
      await recordCourtesyAudit("eligibility.created", {
        eligibilityId: created.id,
        email: userRecord.email,
        message: `Eligibility criada via OAuth (${method})`,
        payload: { landing: parsed.landing, cta: parsed.cta ?? null, userId, sessionId },
      })
    }
    await prisma.trackingEvent.create({
      data: {
        event: "landing_conversion",
        landing: parsed.landing.slice(0, 40),
        cta: parsed.cta ? String(parsed.cta).slice(0, 40) : null,
        method,
        sessionId,
        userId,
      },
    })
    console.log("✅ [eligibility] created for user:", userId, "landing:", parsed.landing)
    cookieStore.delete("bm_landing_source")
  } catch (err) {
    console.error("[eligibility helper] failed:", err)
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      typeProfile: string | null
      urlNameProfessional: string | null
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    typeProfile?: string | null
    urlNameProfessional?: string | null
  }
}

function customAdapter(p: typeof prisma): Adapter {
  const baseAdapter = PrismaAdapter(p)
  
  return {
    ...baseAdapter,

    async getUserByAccount(account) {
      console.log("🔍 getUserByAccount:", account.provider, account.providerAccountId)
      
      try {
        const dbAccount = await p.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          include: { user: true },
        })

        if (!dbAccount) {
          console.log("⚠️ Account não encontrada")
          return null
        }

        if (!dbAccount.user) {
          console.error("❌ Account órfã detectada! Deletando...")
          await p.account.delete({
            where: {
              provider_providerAccountId: {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
              }
            }
          })
          return null
        }

        console.log("✅ User encontrado via account:", dbAccount.user.id)
        return dbAccount.user as unknown as AdapterUser
        
      } catch (error) {
        console.error("❌ Erro em getUserByAccount:", error)
        return null
      }
    },

    async getUserByEmail(email) {
      console.log("🔍 getUserByEmail:", email)
      
      const user = await p.user.findUnique({
        where: { email },
      })

      if (user) {
        console.log("✅ User encontrado por email:", user.id)
        return user as unknown as AdapterUser
      }

      console.log("⚠️ User não encontrado")
      return null
    },

    async linkAccount(account) {
      console.log("🔗 linkAccount:", account.provider, account.userId)
      
      const existing = await p.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          }
        }
      })
      
      if (existing) {
        console.log("✅ Account já existe")
        return
      }
      
      await p.account.create({ data: account })
      console.log("✅ Account criada para userId:", account.userId)
      
      // ✅ NOVO: Marcar email como verificado para OAuth
      await p.user.update({
        where: { id: account.userId },
        data: { 
          emailVerified: new Date(),
          status: true 
        }
      })
      console.log("✅ Email marcado como verificado (OAuth)")
      
      return
    },

    async createSession(session) {
      console.log("🎫 createSession:", session.userId)
      
      const dbSession = await p.session.create({
        data: session,
      })
      
      console.log("✅ Session criada:", dbSession.sessionToken)
      return dbSession
    },

    async getSessionAndUser(sessionToken) {
      console.log("🔍 getSessionAndUser:", sessionToken)
      
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })

      if (!userAndSession) {
        console.log("⚠️ Session não encontrada")
        return null
      }

      const { user, ...session } = userAndSession
      
      console.log("✅ Session encontrada:", user.id)
      
      return {
        user: user as unknown as AdapterUser,
        session,
      }
    },

    async updateSession(session) {
      console.log("🔄 updateSession:", session.sessionToken)
      
      const dbSession = await p.session.update({
        where: { sessionToken: session.sessionToken! },
        data: session,
      })
      
      console.log("✅ Session atualizada")
      return dbSession
    },

    async deleteSession(sessionToken) {
      console.log("🗑️ deleteSession:", sessionToken)
      
      await p.session.delete({
        where: { sessionToken },
      })
      
      console.log("✅ Session deletada")
      return
    },
  } as Adapter
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: customAdapter(prisma),
  trustHost: true,
  
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.username as string }
        })

        if (!user || !user.password) {
          return null
        }

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        console.log("✅ Login autorizado:", user.email)

        if (!user.urlNameProfessional && user.name) {
          const slug = generateSlug(user.name)
          let finalSlug = slug
          let counter = 1

          while (await prisma.user.findFirst({ 
            where: { urlNameProfessional: finalSlug } 
          })) {
            finalSlug = `${slug}-${counter}`
            counter++
          }

          await prisma.user.update({
            where: { id: user.id },
            data: { urlNameProfessional: finalSlug }
          })
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        } as User
      }
    })
  ],
  
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { 
            role: true,
            typeProfile: true,
            urlNameProfessional: true
          }
        })
        
        token.role = dbUser?.role ?? undefined
        token.typeProfile = dbUser?.typeProfile ?? undefined
        token.urlNameProfessional = dbUser?.urlNameProfessional ?? undefined
      }
      
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { 
            typeProfile: true, 
            role: true,
            urlNameProfessional: true
          }
        })
        token.typeProfile = dbUser?.typeProfile ?? undefined
        token.role = dbUser?.role ?? "USER"
        token.urlNameProfessional = dbUser?.urlNameProfessional ?? undefined
      }
      
      return token
    },
    
    async session({ session, user }) {
      if (user) {
        session.user.id = user.id
        
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            role: true,
            typeProfile: true,
            urlNameProfessional: true
          }
        })
        
        session.user.role = dbUser?.role ?? "USER"
        session.user.typeProfile = dbUser?.typeProfile ?? null
        session.user.urlNameProfessional = dbUser?.urlNameProfessional ?? null
      }
      
      return session
    },

    async signIn({ user, account }) {
      console.log("🔐 SignIn:", account?.provider, user.email)

      // ✅ MODIFICADO: Verificar e marcar email para OAuth providers
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (existingUser && !existingUser.emailVerified) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              emailVerified: new Date(),
              status: true,
            }
          })
          console.log("✅ Email verificado automaticamente (OAuth)")
        }

        // 🎁 Cortesia condicional via landing — para usuarios JA EXISTENTES
        // que estao logando de novo. Para usuarios NOVOS via OAuth, usar
        // o evento `linkAccount` abaixo (la o ID do banco ja existe).
        if (existingUser) {
          await tryCreateEligibilityFromCookie(existingUser.id, account?.provider ?? "oauth")
        }
      }

      return true
    },
  },

  events: {
    /**
     * Dispara apos criar Account no banco. Para OAuth novo, este e o
     * primeiro momento em que o user.id real existe. Aqui sim podemos
     * criar a CourtesyEligibility com o userId correto.
     */
    async linkAccount({ user, account }) {
      console.log("🔗 [event] linkAccount:", account.provider, user.id)
      try {
        await tryCreateEligibilityFromCookie(user.id as string, account.provider)
      } catch (err) {
        console.error("[event linkAccount] eligibility hook failed:", err)
      }
    },
  },
  
  pages: {
    signIn: "/login",
  },
})