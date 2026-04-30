// src/app/dashboard/_components/dashboard-total.tsx
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, BarChart3, Settings, Clock, CheckCircle2 } from "lucide-react";
import prisma from "@/lib/prisma";

interface DashboardTotalProps {
  userId: string;
}

export async function DashboardTotal({ userId }: DashboardTotalProps) {
  // ✅ Buscar estatísticas completas
  const [
    uniqueDatesCount,
    totalSlotsCount,
    appointmentsCount,
    user
  ] = await Promise.all([
    // 1. Contar quantas DATAS têm agenda aberta (datas únicas)
    prisma.availableSlot.findMany({
      where: { userId },
      distinct: ['date'],
      select: { date: true }
    }).then(slots => slots.length),

    // 2. Contar TOTAL de horários disponibilizados
    prisma.availableSlot.count({ where: { userId } }),

    // 3. Contar agendamentos confirmados
    prisma.appointment.count({ where: { userId } }),

    // 4. Nome do usuário
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    }),
  ]);

  const stats = [
    {
      title: "Minha Agenda",
      description: "Datas com agenda aberta",
      value: uniqueDatesCount,
      icon: Calendar,
      href: "/dashboard/my-schedule",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "Meus Agendamentos - Horários Disponíveis",
      description: "Total de slots disponibilizados",
      value: totalSlotsCount,
      icon: Clock,
      href: "/dashboard/my-schedule",
      color: "blue",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      title: "Meus Agendamentos - Consultas Marcadas",
      description: "Consultas agendadas",
      value: appointmentsCount,
      icon: CheckCircle2,
      href: "/dashboard/appointments",
      color: "purple",
      gradient: "from-purple-500 to-pink-600",
    },
  ];

  const quickActions = [
    {
      title: "Abrir Minha Agenda",
      description: "Configure horários disponíveis",
      icon: Calendar,
      href: "/dashboard/my-schedule",
      color: "emerald",
    },
    {
      title: "Ver Agendamentos",
      description: "Visualize seus compromissos",
      icon: Users,
      href: "/dashboard/appointments",
      color: "blue",
    },
    {
      title: "Relatórios",
      description: "Análises e estatísticas",
      icon: BarChart3,
      href: "/dashboard/reports",
      color: "orange",
    },
    {
      title: "Editar Perfil",
      description: "Atualize suas informações",
      icon: Settings,
      href: "/dashboard/profile",
      color: "gray",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 break-words">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2 text-base md:text-lg">
            Bem-vindo ao seu painel de controle completo
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:gap-6 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} href={stat.href}>
                <Card className="border-2 border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all cursor-pointer group">
                  <CardContent className="pt-6">
                    <div className="flex flex-col space-y-4">
                      {/* Ícone com gradiente */}
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} w-fit shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      
                      {/* Números e descrição */}
                      <div>
                        <p className="text-4xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          {stat.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Ações Rápidas */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            Ações Rápidas
          </h2>
          <div className="grid gap-4 md:gap-6 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all cursor-pointer h-full group">
                    <CardHeader>
                      <div className={`p-3 rounded-lg bg-${action.color}-100 w-fit group-hover:bg-${action.color}-200 transition-colors`}>
                        <Icon className={`h-6 w-6 text-${action.color}-600`} />
                      </div>
                      <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
                        {action.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {action.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}