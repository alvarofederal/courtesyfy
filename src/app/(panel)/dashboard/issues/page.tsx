import { redirect } from "next/navigation"
import { LifeBuoy, Lock, CalendarClock, HelpCircle, Clock, CheckCircle2, ShieldAlert } from "lucide-react"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminTickets, getAdminTicketMetrics } from "./_data_access/get-admin-tickets"
import { AdminTicketsTable } from "./_components/admin-tickets-table"
import { AdminCreateTicketModal } from "./_components/admin-create-ticket-modal"

export default async function IssuesAdminPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard/profile")

  const [tickets, metrics] = await Promise.all([
    getAdminTickets(),
    getAdminTicketMetrics(),
  ])

  const cards = [
    {
      title: "Acesso — Abertos",
      value: metrics.accessOpen,
      icon: Lock,
      cardClass: "border-emerald-200 bg-white",
      iconClass: "text-emerald-700",
    },
    {
      title: "Agendamento — Abertos",
      value: metrics.schedulingOpen,
      icon: CalendarClock,
      cardClass: "border-teal-200 bg-white",
      iconClass: "text-teal-700",
    },
    {
      title: "Outros — Abertos",
      value: metrics.otherOpen,
      icon: HelpCircle,
      cardClass: "border-gray-200 bg-white",
      iconClass: "text-gray-700",
    },
    {
      title: "Aguardando usuário",
      value: metrics.waitingUser,
      icon: Clock,
      cardClass: "border-orange-200 bg-white",
      iconClass: "text-orange-700",
    },
    {
      title: "Resolvidos hoje",
      value: metrics.resolvedToday,
      icon: CheckCircle2,
      cardClass: "border-emerald-200 bg-white",
      iconClass: "text-emerald-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-4 md:space-y-6">
        {/* Faixa Modo Administrador */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm px-4 py-3 rounded-lg flex items-center gap-2 shadow-md">
          <ShieldAlert className="w-5 h-5" />
          <div>
            <p className="font-semibold">Modo Administrador</p>
            <p className="text-xs text-purple-100">Você está gerenciando tipos de atendimento do sistema</p>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shrink-0">
                <LifeBuoy className="w-5 h-5 text-white" />
              </div>
              Chamados
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Atendimentos ordenados do mais antigo para o mais recente ({metrics.total} no total)
            </p>
          </div>
          <AdminCreateTicketModal adminId={session.user.id} />
        </div>

        {/* Métricas */}
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {cards.map((c) => {
            const Icon = c.icon
            return (
              <Card key={c.title} className={`${c.cardClass} shadow-sm`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-medium text-gray-700 flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${c.iconClass}`} />
                    {c.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tabela com filtros em card branco shadow-sm */}
        <div className="border border-emerald-200 rounded-lg bg-white shadow-sm p-4 space-y-4">
          <AdminTicketsTable tickets={tickets} />
        </div>
      </div>
    </div>
  )
}
