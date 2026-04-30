// src/app/(panel)/dashboard/profile/page.tsx

import getSesion from '@/lib/getSession'
import { redirect } from 'next/navigation'
import { getUserData, getAllTypeServices } from './_data_access/get-info-use'
import { getAdminStats } from './_data_access/get-admin-stats'
import { ProfileContent } from './_components/profile'
import { AdminProfileView } from './_components/admin-profile-view'
import { getUserCourtesy } from '../courtesies/_data_access/get-courtesy'
import { FloatingCourtesyButton } from '../courtesies/_components/floating-courtesy-button'
import { FloatingTicketButton } from '../issues/_components/floating-ticket-button'

export default async function Profile() {
  const session = await getSesion()

  if (!session) {
    redirect("/")
  }

  const user = await getUserData({ userId: session.user?.id })

  if (!user) {
    redirect("/")
  }

  // Admin: perfil enxuto, sem dados profissionais/assinatura/cortesia
  if (session.user?.role === "ADMIN") {
    const stats = await getAdminStats()
    return (
      <AdminProfileView
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }}
        stats={stats}
      />
    )
  }

  // Usuário profissional: perfil completo
  const allTypeServices = await getAllTypeServices()
  const courtesy = await getUserCourtesy(user.id)

  return (
    <div className="relative">
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <FloatingCourtesyButton
          hasActiveCourtesy={!!courtesy?.isActive}
          courtesyExpiresAt={courtesy?.expiresAt ?? null}
          daysRemaining={courtesy?.daysRemaining}
          planType={user.subscription?.plan ?? null}
          subscriptionStatus={user.subscription?.status ?? null}
          userRole={session.user?.role ?? null}
          placement="inline"
        />
        <FloatingTicketButton userId={user.id} />
      </div>
      <ProfileContent
        user={user}
        allTypeServices={allTypeServices}
      />
    </div>
  )
}
