// src/app/onboarding/complete-profile/page.tsx
import Image from "next/image"
import logoImg from '../../../../public/logo-odonto.png'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { CompleteProfileForm } from "./_components/complete-profile-form"
import { autoRedeemCourtesyFromCookie } from "../../(panel)/dashboard/courtesies/_actions/auto-redeem-courtesy"
import { getUserCourtesy } from "../../(panel)/dashboard/courtesies/_data_access/get-courtesy"
import { CourtesyBadgeHeader } from "@/components/courtesy-badge-header"

export default async function CompleteProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Verificar estado do onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profession: true,
      subscription: true // 🔥 ADICIONAR para validar limite
    }
  })

  if (!user) {
    redirect("/login")
  }

  if (!user.emailVerified) {
    redirect("/verify-email")
  }

  if (!user.typeProfile) {
    redirect("/onboarding/select-profile")
  }

  // Tenta resgatar cortesia pendente (caso o usuário tenha pulado a tela anterior).
  await autoRedeemCourtesyFromCookie()
  const courtesy = await getUserCourtesy(session.user.id)

  // Se já completou, redirecionar para dashboard
  if (user.name && user.cpf && user.phone && user.professionId && user.registration) {
    // 🔥 NOVO: Verificar se tem tipos de atendimento
    const hasTypeServices = await prisma.userTypeService.count({
      where: { userId: user.id }
    })
    
    if (hasTypeServices > 0) {
      redirect("/dashboard")
    }
  }

  // Buscar profissões
  const professions = await prisma.profession.findMany({
    where: { status: true },
    orderBy: { name: 'asc' }
  })
  
  // 🔥 NOVO: Buscar tipos de atendimento disponíveis
  const typeServices = await prisma.typeService.findMany({
    where: { status: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        {courtesy?.isActive && courtesy.code && (
          <CourtesyBadgeHeader
            code={courtesy.code}
            expiresAt={courtesy.expiresAt}
            daysRemaining={courtesy.daysRemaining}
          />
        )}
        {/* Logo e Título */}
        <div className="text-center">
          <Image
            src={logoImg}
            alt="BaseMedical"
            width={200}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">
            Complete seu Cadastro
          </h1>
          <p className="text-gray-600 mt-2">
            Preencha suas informações profissionais para começar
          </p>
        </div>

        {/* Formulário */}
        <CompleteProfileForm 
          userId={session.user.id} 
          professions={professions}
          typeServices={typeServices}
          userData={user}
        />
      </div>
    </div>
  )
}