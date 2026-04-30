import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye, ClipboardList, Users } from "lucide-react";
import prisma from "@/lib/prisma";

interface DashboardWaitlistProps {
  userId: string;
}

export async function DashboardWaitlist({ userId }: DashboardWaitlistProps) {
  const [user, waitlistCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        urlNameProfessional: true,
      },
    }),
    prisma.waitlist.count({ where: { professionalId: userId } }),
  ]);

  const actions = [
    {
      title: "Gerenciar Lista de Espera",
      description: "Veja quem está interessado em seus serviços",
      icon: ClipboardList,
      href: "/dashboard/waitlist",
      color: "purple",
      stat: `${waitlistCount} pessoa(s)`,
    },
    {
      title: "Ver Página Pública",
      description: "Veja como sua página aparece para os visitantes",
      icon: Eye,
      href: `/profissional/${user?.urlNameProfessional}`,
      color: "blue",
      external: true,
    },
    {
      title: "Editar Perfil",
      description: "Atualize suas informações profissionais",
      icon: Settings,
      href: "/dashboard/profile",
      color: "emerald",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 break-words">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2 text-base md:text-lg">
            Lista de Espera - Gerencie interessados em seus serviços
          </p>
        </div>

        {/* Stats */}
        <Card className="border-purple-200 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">Total na Lista</p>
                <p className="text-3xl md:text-4xl font-bold text-purple-600 mt-2">{waitlistCount}</p>
              </div>
              <Users className="h-12 w-12 md:h-16 md:w-16 text-purple-500 opacity-80 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
          <div className="grid gap-4 md:gap-6 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                >
                  <Card className="border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className={`p-3 rounded-lg bg-${action.color}-100 w-fit`}>
                        <Icon className={`h-6 w-6 text-${action.color}-600`} />
                      </div>
                      <CardTitle className="text-xl">{action.title}</CardTitle>
                      <CardDescription className="text-base">
                        {action.description}
                      </CardDescription>
                      {action.stat && (
                        <p className="text-lg font-semibold text-purple-600 mt-2">
                          {action.stat}
                        </p>
                      )}
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