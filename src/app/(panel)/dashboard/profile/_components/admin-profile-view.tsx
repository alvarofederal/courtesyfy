import Link from "next/link"
import {
  ShieldAlert,
  Users,
  LifeBuoy,
  Gift,
  CreditCard,
  BarChart3,
  Settings,
  UserCog,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AvatarProfile } from "./profile-avatar"
import { AdminNameForm } from "./admin-name-form"

interface AdminProfileViewProps {
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  stats: {
    totalUsers: number
    openTickets: number
    activeCourtesies: number
    activeSubscriptions: number
  }
}

export function AdminProfileView({ user, stats }: AdminProfileViewProps) {
  const metrics = [
    {
      title: "Profissionais",
      value: stats.totalUsers,
      icon: Users,
      href: "/dashboard/users",
      cardClass: "border-emerald-200 bg-white",
      iconClass: "text-emerald-700",
    },
    {
      title: "Chamados abertos",
      value: stats.openTickets,
      icon: LifeBuoy,
      href: "/dashboard/issues",
      cardClass: "border-teal-200 bg-white",
      iconClass: "text-teal-700",
    },
    {
      title: "Cortesias ativas",
      value: stats.activeCourtesies,
      icon: Gift,
      href: "/dashboard/courtesies",
      cardClass: "border-emerald-200 bg-white",
      iconClass: "text-emerald-600",
    },
    {
      title: "Assinaturas ativas",
      value: stats.activeSubscriptions,
      icon: CreditCard,
      href: "/dashboard/metrics",
      cardClass: "border-emerald-200 bg-white",
      iconClass: "text-emerald-700",
    },
  ]

  const shortcuts = [
    { label: "Profissionais", href: "/dashboard/users", icon: Users },
    { label: "Chamados", href: "/dashboard/issues", icon: LifeBuoy },
    { label: "Cortesias", href: "/dashboard/courtesies", icon: Gift },
    { label: "Métricas", href: "/dashboard/metrics", icon: BarChart3 },
    { label: "Profissões", href: "/dashboard/professions", icon: Settings },
    { label: "Especialidades", href: "/dashboard/speciality", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full space-y-4 md:space-y-6">
        {/* Faixa Modo Administrador */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm px-4 py-3 rounded-lg flex items-center gap-2 shadow-md">
          <ShieldAlert className="w-5 h-5" />
          <div>
            <p className="font-semibold">Modo Administrador</p>
            <p className="text-xs text-purple-100">Perfil simplificado — sem dados profissionais ou de assinatura</p>
          </div>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shrink-0">
              <UserCog className="w-5 h-5 text-white" />
            </div>
            Meu Perfil
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Gerencie suas informações básicas e acesse atalhos administrativos.
          </p>
        </div>

        {/* Métricas do sistema */}
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {metrics.map((m) => {
            const Icon = m.icon
            return (
              <Link key={m.title} href={m.href}>
                <Card className={`${m.cardClass} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-gray-700 flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${m.iconClass}`} />
                      {m.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Card do perfil */}
          <Card className="border-emerald-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Foto e dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <AvatarProfile userId={user.id} avatarUrl={user.image} />
              </div>
              <AdminNameForm defaultName={user.name ?? ""} email={user.email} />
            </CardContent>
          </Card>

          {/* Atalhos administrativos */}
          <Card className="border-emerald-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Atalhos administrativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
                {shortcuts.map((s) => {
                  const Icon = s.icon
                  return (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex items-center gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{s.label}</span>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
