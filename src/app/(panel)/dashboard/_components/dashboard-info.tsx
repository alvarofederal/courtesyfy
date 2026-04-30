import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye, CreditCard, MapPin } from "lucide-react";
import prisma from "@/lib/prisma";

interface DashboardInfoProps {
  userId: string;
}

export async function DashboardInfo({ userId }: DashboardInfoProps) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      urlNameProfessional: true,
      addresses: { select: { address: true } },
    },
  });

  const actions = [
    {
      title: "Editar Perfil",
      description: "Atualize suas informações profissionais",
      icon: Settings,
      href: "/dashboard/profile",
      color: "emerald",
    },
    {
      title: "Ver Meu Perfil Público",
      description: "Veja como seu perfil aparece para os visitantes",
      icon: Eye,
      href: `/profissional/${user?.urlNameProfessional}`,
      color: "blue",
      external: true,
    },
    {
      title: "Cartão Virtual",
      description: "Configure seu cartão de visita digital (Em breve)",
      icon: CreditCard,
      href: "/dashboard/card",
      color: "purple",
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 break-words">
            Olá, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2 text-base md:text-lg">
            Perfil Informativo - Gerencie suas informações profissionais
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              Suas Informações
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">URL do Perfil</p>
                <p className="text-lg font-medium text-gray-900">
                  {user?.urlNameProfessional ? (
                    <Link
                      href={`/profissional/${user.urlNameProfessional}`}
                      target="_blank"
                      className="text-blue-600 hover:underline break-all"
                    >
                      basemedical.online/profissional/{user.urlNameProfessional}
                    </Link>
                  ) : (
                    "Configure seu perfil primeiro"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Locais de Atendimento</p>
                <p className="text-lg font-medium text-gray-900">
                  {user?.addresses && user.addresses.length > 0
                    ? `${user.addresses.length} local(is) cadastrado(s)`
                    : "Nenhum local cadastrado"}
                </p>
              </div>
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
                  className={action.disabled ? "pointer-events-none opacity-50" : ""}
                >
                  <Card className="border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardHeader>
                      <div className={`p-3 rounded-lg bg-${action.color}-100 w-fit`}>
                        <Icon className={`h-6 w-6 text-${action.color}-600`} />
                      </div>
                      <CardTitle className="text-xl">{action.title}</CardTitle>
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