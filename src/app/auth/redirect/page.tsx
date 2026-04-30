// src/app/auth/redirect/page.tsx
"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function AuthRedirectPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const hasChecked = useRef(false)

  useEffect(() => {
    // Evitar dupla execução
    if (hasChecked.current) return

    async function checkOnboarding() {
      console.log("🔄 Status atual:", status)

      // Aguardar sessão estar pronta (max 3 segundos)
      let waitTime = 0
      const maxWait = 3000
      const interval = 300

      while (status === "loading" && waitTime < maxWait) {
        console.log(`⏳ Aguardando sessão... (${waitTime}ms)`)
        await new Promise(resolve => setTimeout(resolve, interval))
        waitTime += interval
      }

      // Se ainda não autenticado após espera, voltar para login
      if (status === "unauthenticated" || !session?.user?.id) {
        console.log("❌ Não autenticado após aguardar")
        router.push("/login")
        return
      }

      // ✅ Autenticado, verificar onboarding
      console.log("✅ Sessão OK, verificando onboarding...")
      hasChecked.current = true

      try {
        const response = await fetch("/api/user/onboarding-status")
        const data = await response.json()

        console.log("📊 Status:", data)

        if (data.error) {
          router.push("/login")
          return
        }

        if (!data.emailVerified) {
          router.push("/verify-email")
        } else if (!data.typeProfile) {
          router.push("/onboarding/select-profile")
        } else if (!data.profileComplete) {
          router.push("/onboarding/complete-profile")
        } else {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("❌ Erro:", error)
        router.push("/login")
      }
    }

    // Executar após pequeno delay para garantir que sessão foi criada
    const timer = setTimeout(() => {
      checkOnboarding()
    }, 500)

    return () => clearTimeout(timer)
  }, [status, session, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Verificando autenticação...</p>
      </div>
    </div>
  )
}