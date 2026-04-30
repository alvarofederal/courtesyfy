// src/app/onboarding/select-profile/page.tsx
import { Card } from "@/components/ui/card"
import Image from "next/image"
import logoImg from '../../../../public/logo-odonto.png'
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { SelectProfileForm } from "./_components/select-profile-form"
import { autoRedeemCourtesyFromCookie } from "../../(panel)/dashboard/courtesies/_actions/auto-redeem-courtesy"
import { getUserCourtesy } from "../../(panel)/dashboard/courtesies/_data_access/get-courtesy"
import { CourtesyBadgeHeader } from "@/components/courtesy-badge-header"

export default async function SelectProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Verificar se email foi verificado
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailVerified: true,
      typeProfile: true,
      name: true
    }
  })

  if (!user?.emailVerified) {
    redirect("/verify-email")
  }

  // Tenta resgatar cortesia do cookie (setado pelo QR do voucher em /register).
  // É silencioso: se falhar, segue o onboarding normalmente.
  await autoRedeemCourtesyFromCookie()
  const courtesy = await getUserCourtesy(session.user.id)

  // Se já selecionou perfil, redirecionar
  if (user.typeProfile) {
    if (!user.name) {
      redirect("/onboarding/complete-profile")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {courtesy?.isActive && courtesy.code && (
          <CourtesyBadgeHeader
            code={courtesy.code}
            expiresAt={courtesy.expiresAt}
            daysRemaining={courtesy.daysRemaining}
          />
        )}
        {/* Logo */}
        <div className="text-center">
          <Image
            src={logoImg}
            alt="BaseMedical"
            width={200}
            height={80}
            className="mx-auto mb-4"
          />
          {/* Título */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Escolha o Melhor Perfil para Você
            </h2>
            <p className="text-gray-600">
              Compare os recursos e selecione o perfil que melhor atende suas necessidades
            </p>
          </div>
        </div>

        {/* Form */}
        <SelectProfileForm userId={session.user.id} />
      </div>
    </div>
  )
}