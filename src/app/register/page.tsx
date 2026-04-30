// src/app/register/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { Gift } from "lucide-react"
import { RegisterForm } from "./_components/register-form"
import { Header } from "../(public)/_components/header"
import { Footer } from "../(public)/_components/footer"
import { normalizeKeyInput, isValidKeyFormat } from "@/utils/courtesy/generate-key"

export const PENDING_COURTESY_COOKIE = "pending_courtesy_key"

interface PageProps {
  searchParams: Promise<{ courtesy?: string }>
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const session = await auth()
  const { courtesy } = await searchParams

  // Se veio com ?courtesy= e o formato for válido, persiste em cookie
  // para sobreviver ao fluxo de verificação/OAuth.
  let pendingCourtesy: string | null = null
  if (courtesy) {
    const normalized = normalizeKeyInput(courtesy)
    if (isValidKeyFormat(normalized)) {
      pendingCourtesy = normalized
      const cookieStore = await cookies()
      cookieStore.set(PENDING_COURTESY_COOKIE, normalized, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24h
        path: "/",
      })
    }
  }

  // Se está logado, redireciona
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
    <Header />
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Criar conta</h1>
          <p className="text-gray-600 mt-2">Comece a usar o BaseMedical</p>
        </div>

        {pendingCourtesy && (
          <div className="mb-6 rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <div className="flex items-start gap-3">
              <Gift className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  Cortesia detectada!
                </p>
                <p className="text-xs text-emerald-800 mt-1">
                  Código <span className="font-mono font-semibold">{pendingCourtesy}</span>.
                  Complete seu cadastro e a cortesia será ativada automaticamente ao entrar.
                </p>
              </div>
            </div>
          </div>
        )}

        <RegisterForm />
      </div>
    </div>
    <Footer />
  </div>
  )
}