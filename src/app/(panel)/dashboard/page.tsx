// src/app/dashboard/page.tsx - CORRIGIR
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth" // ✅ Importar auth
import prisma from "@/lib/prisma"
import { DashboardTotal } from "./_components/dashboard-total"
import { DashboardInfo } from "./_components/dashboard-info"
import { DashboardWaitlist } from "./_components/dashboard-waitlist"
import { DashboardAdmin } from "./_components/dashboard-admin"
import { EligibilityBanner } from "./_components/eligibility-banner"

export default async function DashboardPage() {
  // ✅ Usar auth() em vez de cookie manual
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // ADMIN: dashboard administrativo (sem checks de onboarding de profissional)
  if (session.user.role === "ADMIN") {
    return <DashboardAdmin adminName={session.user.name} />
  }

  // ✅ Buscar dados completos do usuário
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
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
    redirect("/login")
  }

  if (!user.emailVerified) redirect("/verify-email")
  if (!user.typeProfile) redirect("/onboarding/select-profile")
  
  const complete = !!(user.name && user.cpf && user.phone && user.professionId && user.registration)
  if (!complete) redirect("/onboarding/complete-profile")

  const dashboardContent = (() => {
    switch (user.typeProfile) {
      case "TOTAL":
        return <DashboardTotal userId={user.id} />
      case "INFO":
        return <DashboardInfo userId={user.id} />
      case "WAITLIST":
        return <DashboardWaitlist userId={user.id} />
      default:
        return <DashboardTotal userId={user.id} />
    }
  })()

  return (
    <>
      <EligibilityBanner userId={user.id} />
      {dashboardContent}
    </>
  )
}