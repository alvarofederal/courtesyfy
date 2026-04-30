import Link from "next/link"
import {
  CalendarClock,
  CheckCircle2,
  XCircle,
  Briefcase,
  Folder,
  Gift,
  Sparkles,
  KeyRound,
  Archive,
  ArrowRight,
  ShieldAlert,
  LayoutDashboard,
  Users,
  LifeBuoy,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"

interface DashboardAdminProps {
  adminName?: string | null
}

export async function DashboardAdmin({ adminName }: DashboardAdminProps) {
  const now = new Date()

  const [
    openAppointments,
    successAppointments,
    abandonedAppointments,
    servicesCount,
    professionsCount,
    totalUsers,
    openTickets,
    totalKeys,
    activeKeys,
    printedUnusedKeys,
    archivedKeys,
  ] = await Promise.all([
    prisma.appointment.count({ where: { appointmentDate: { gte: now } } }),
    prisma.appointment.count({
      where: { appointmentDate: { lt: now }, confirmed: true },
    }),
    prisma.appointment.count({
      where: { appointmentDate: { lt: now }, confirmed: false },
    }),
    prisma.typeService.count({ where: { status: true } }),
    prisma.profession.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.supportTicket.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS", "WAITING_USER"] } },
    }),
    prisma.courtesyKey.count(),
    prisma.courtesyKey.count({
      where: {
        redeemedByUserId: { not: null },
        validUntil: { gt: now },
        archivedAt: null,
      },
    }),
    prisma.courtesyKey.count({
      where: {
        printedAt: { not: null },
        redeemedAt: null,
        validUntil: { gt: now },
        archivedAt: null,
      },
    }),
    prisma.courtesyKey.count({ where: { archivedAt: { not: null } } }),
  ])

  const appointmentMetrics = [
    {
      title: "Agendamentos abertos",
      description: "Com marcação futura",
      value: openAppointments,
      icon: CalendarClock,
      cardClass: "border-emerald-200 bg-white",
      iconClass: "text-emerald-700",
    },
    {
      title: "Concluídos com sucesso",
      description: "Passados e confirmados",
      value: successAppointments,
      icon: CheckCircle2,
      cardClass: "border-emerald-200 bg-emerald-50",
      iconClass: "text-emerald-700",
    },
    {
      title: "Abandonados",
      description: "Passados sem confirmação",
      value: abandonedAppointments,
      icon: XCircle,
      cardClass: "border-rose-200 bg-rose-50",
      iconClass: "text-rose-600",
    },
  ]

  const systemMetrics = [
    {
      title: "Profissionais",
      description: "Usuários cadastrados",
      value: totalUsers,
      icon: Users,
      href: "/dashboard/users",
    },
    {
      title: "Chamados abertos",
      description: "Em atendimento ou aguardando",
      value: openTickets,
      icon: LifeBuoy,
      href: "/dashboard/issues",
    },
  ]

  const catalogMetrics = [
    {
      title: "Serviços",
      description: "Tipos de atendimento ativos",
      value: servicesCount,
      icon: Briefcase,
      href: "/dashboard/services",
    },
    {
      title: "Profissões",
      description: "Profissões cadastradas",
      value: professionsCount,
      icon: Folder,
      href: "/dashboard/professions",
    },
  ]

  const courtesyMetrics = [
    {
      title: "Total de Cortesias",
      value: totalKeys,
      icon: Gift,
      cardClass: "border-emerald-200 bg-white",
      iconClass: "text-emerald-600",
    },
    {
      title: "Cortesias Ativas",
      value: activeKeys,
      icon: Sparkles,
      cardClass: "border-emerald-200 bg-emerald-50",
      iconClass: "text-emerald-700",
    },
    {
      title: "Impressas não resgatadas",
      value: printedUnusedKeys,
      icon: KeyRound,
      cardClass: "border-teal-200 bg-teal-50",
      iconClass: "text-teal-700",
    },
    {
      title: "Arquivadas",
      value: archivedKeys,
      icon: Archive,
      cardClass: "border-amber-200 bg-amber-50",
      iconClass: "text-amber-700",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-6 md:space-y-8">
        {/* Faixa Modo Administrador */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm px-4 py-3 rounded-lg flex items-center gap-2 shadow-md">
          <ShieldAlert className="w-5 h-5" />
          <div>
            <p className="font-semibold">Modo Administrador</p>
            <p className="text-xs text-purple-100">Visão geral da plataforma</p>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shrink-0">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="min-w-0 break-words">Bem-vindo{adminName ? `, ${adminName}` : ""}</span>
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Painel administrativo — acompanhe métricas e acesse as áreas do sistema.
          </p>
        </div>

        {/* Agendamentos */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-emerald-600" />
            Agendamentos
          </h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {appointmentMetrics.map((m) => {
              const Icon = m.icon
              return (
                <Card key={m.title} className={`${m.cardClass} shadow-sm`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">{m.title}</CardTitle>
                    <Icon className={`h-5 w-5 ${m.iconClass}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{m.value}</div>
                    <p className="text-xs text-gray-600 mt-1">{m.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Sistema */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Sistema
          </h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {systemMetrics.map((m) => {
              const Icon = m.icon
              return (
                <Card key={m.title} className="border-emerald-200 bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">{m.title}</CardTitle>
                    <Icon className="h-5 w-5 text-emerald-700" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{m.value}</div>
                      <p className="text-xs text-gray-600 mt-1">{m.description}</p>
                    </div>
                    <Link href={m.href}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-sm"
                      >
                        Acessar <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Catálogo */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            Catálogo
          </h2>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {catalogMetrics.map((m) => {
              const Icon = m.icon
              return (
                <Card key={m.title} className="border-emerald-200 bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">{m.title}</CardTitle>
                    <Icon className="h-5 w-5 text-emerald-700" />
                  </CardHeader>
                  <CardContent className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{m.value}</div>
                      <p className="text-xs text-gray-600 mt-1">{m.description}</p>
                    </div>
                    <Link href={m.href}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        Gerenciar <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Cortesias */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-600" />
              Cortesias
            </h2>
            <Link href="/dashboard/courtesies">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
              >
                Gerenciar <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
            {courtesyMetrics.map((m) => {
              const Icon = m.icon
              return (
                <Card key={m.title} className={`${m.cardClass} shadow-sm`}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">{m.title}</CardTitle>
                    <Icon className={`h-5 w-5 ${m.iconClass}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{m.value}</div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
