import { Button } from '@/components/ui/button'
import getSession from '@/lib/getSession'
import { Calendar } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { checkSubscription } from '@/utils/permissions/checkSubscription'
import { LabelSubscription } from '@/components/ui/label-subscription'
import { ExpirationWarning } from '@/components/ui/expiration-warning'
import { canPermission } from '@/utils/permissions/canPermission'
import { Appointments } from '../_components/appointments/appointments'
import { ButtonCopyLink } from '../_components/button-copy-link'

export default async function AppointmentsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }
  
  // ✅ Apenas perfil TOTAL pode acessar
  if (session.user.typeProfile !== "TOTAL") {
    redirect("/dashboard");
  }

  const subscription = await checkSubscription(session?.user?.id!)
  const permissionsAppointment = await canPermission({ type: "appointment" }) // Adjusted to a valid TypeCheck value

  return (
    <main>
      {/*subscription?.subscriptionStatus !== "EXPIRED" && (
        <div className='space-x-2 flex items-center justify-end'>
          <Link
            href={`/profissional/${session.user?.urlNameProfessional}`}
            target='_blank' >
            <Button className='bg-emerald-500 hover:bg-emerald-400 flex-1 md:flex-[0]'>
              <Calendar className='w-5 h-5' />
              <span>Novo agendamento</span>
            </Button>
          </Link>

          <ButtonCopyLink userId={session.user?.urlNameProfessional!} />
        </div>
      )*/}

      {subscription?.subscriptionStatus === "EXPIRED" && (
        <LabelSubscription permission={permissionsAppointment} />
      )}

      <ExpirationWarning userId={session.user!.id!} />

      {subscription?.subscriptionStatus !== "EXPIRED" && (
        <section className='mt-4'>
          <Appointments userId={session.user?.id!} />
         </section>
      )}
    </main>
  )
}