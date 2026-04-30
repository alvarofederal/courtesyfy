// src/app/auth/check-and-redirect/page.tsx
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export default async function CheckAndRedirectPage() {
  console.log("🔍 Verificando sessão após OAuth...")

  // ✅ Buscar sessão do cookie
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("authjs.session-token")?.value

  if (!sessionToken) {
    console.log("❌ Sem sessão, redirecionando para login")
    redirect("/login")
  }

  // ✅ Buscar sessão no banco
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  })

  if (!session || !session.user) {
    console.log("❌ Sessão inválida")
    redirect("/login")
  }

  console.log("✅ Sessão encontrada:", session.userId)

  // ✅ Verificar onboarding
  const user = session.user

  if (!user.emailVerified) {
    console.log("⚠️ Email não verificado")
    redirect("/verify-email")
  }

  if (!user.typeProfile) {
    console.log("⚠️ Sem typeProfile")
    redirect("/onboarding/select-profile")
  }

  const profileComplete = !!(
    user.name && 
    user.cpf && 
    user.phone && 
    user.professionId && 
    user.registration
  )

  if (!profileComplete) {
    console.log("⚠️ Perfil incompleto")
    redirect("/onboarding/complete-profile")
  }

  console.log("✅ Onboarding completo, indo para dashboard")
  redirect("/dashboard")
}