import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import Link from "next/link"
import {
  Megaphone,
  Key,
  ShoppingBag,
  TrendingUp,
  Plus,
  ArrowRight,
  Building2,
  Users,
  AlertCircle,
} from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const isSuperAdmin = session.user.role === "SUPER_ADMIN"

  if (isSuperAdmin) {
    return <SuperAdminDashboard />
  }

  if (!session.user.lojaId) redirect("/onboarding/loja")

  const lojaId = session.user.lojaId

  const [loja, campanhasAtivas, totalChaves, resgatesToday] = await Promise.all([
    db.loja.findUnique({
      where: { id: lojaId },
      select: { nome: true, plano: true, status: true },
    }),
    db.campanha.count({
      where: { lojaId, status: "ATIVA" },
    }),
    db.chave.count({
      where: { lojaId },
    }),
    db.resgate.count({
      where: {
        lojaId,
        resgatadoEm: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  const chavesAtivas = await db.chave.count({
    where: { lojaId, status: { in: ["GERADA", "ATIVADA"] } },
  })

  const semDados = totalChaves === 0 && campanhasAtivas === 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Olá, {session.user.name?.split(" ")[0] ?? "Lojista"} 👋
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm truncate">{loja?.nome}</p>
        </div>
        <Link
          href="/dashboard/campanhas/nova"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Nova campanha</span>
          <span className="xs:hidden sr-only">Nova</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Campanhas ativas",
            value: campanhasAtivas,
            icon: Megaphone,
            color: "text-emerald-600 bg-emerald-50",
            href: "/dashboard/campanhas",
          },
          {
            label: "Chaves geradas",
            value: totalChaves,
            icon: Key,
            color: "text-blue-600 bg-blue-50",
            href: "/dashboard/chaves",
          },
          {
            label: "Chaves disponíveis",
            value: chavesAtivas,
            icon: TrendingUp,
            color: "text-purple-600 bg-purple-50",
            href: "/dashboard/chaves",
          },
          {
            label: "Resgates hoje",
            value: resgatesToday,
            icon: ShoppingBag,
            color: "text-orange-600 bg-orange-50",
            href: "/dashboard/resgates",
          },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Empty state — sem nenhuma campanha ainda */}
      {semDados && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center mb-8">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Comece criando sua primeira campanha
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Crie uma campanha, gere um lote de chaves únicas com QR Code e distribua para seus clientes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/campanhas/nova"
              className="inline-flex items-center justify-center gap-2 bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar campanha
            </Link>
            <Link
              href="/dashboard/chaves"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Key className="w-4 h-4" />
              Gerenciar chaves
            </Link>
          </div>
        </div>
      )}

      {/* Ações rápidas */}
      {!semDados && (
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/campanhas/nova"
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-sm transition-all group flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
              <Megaphone className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Nova campanha</p>
              <p className="text-gray-500 text-xs mt-0.5">Criar e configurar</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 ml-auto transition-colors" />
          </Link>

          <Link
            href="/dashboard/chaves"
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-sm transition-all group flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Gerar chaves</p>
              <p className="text-gray-500 text-xs mt-0.5">Criar novo lote</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 ml-auto transition-colors" />
          </Link>

          <Link
            href="/dashboard/resgates"
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-sm transition-all group flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Validar resgate</p>
              <p className="text-gray-500 text-xs mt-0.5">Scanner de chave</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 ml-auto transition-colors" />
          </Link>
        </div>
      )}

      {/* Plano */}
      {loja?.plano === "ESSENCIAL" && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-amber-800 text-sm font-medium">Você está no plano Essencial</p>
            <p className="text-amber-700 text-xs mt-0.5">Limite de 3 campanhas e 100 chaves/mês.</p>
          </div>
          <Link
            href="/dashboard/configuracoes/plano"
            className="text-amber-700 text-xs font-semibold hover:text-amber-900 whitespace-nowrap"
          >
            Ver planos →
          </Link>
        </div>
      )}
    </div>
  )
}

async function SuperAdminDashboard() {
  const [totalLojas, totalUsuarios, totalChaves, resgatesToday] = await Promise.all([
    db.loja.count(),
    db.user.count(),
    db.chave.count(),
    db.resgate.count({
      where: {
        resgatadoEm: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  const lojasRecentes = await db.loja.findMany({
    take: 5,
    orderBy: { criadoEm: "desc" },
    select: { id: true, nome: true, plano: true, status: true, criadoEm: true },
  })

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Painel Super Admin</h1>
        <p className="text-gray-500 mt-0.5 text-sm">Visão geral de toda a plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Lojas cadastradas", value: totalLojas, icon: Building2, color: "text-emerald-600 bg-emerald-50", href: "/dashboard/lojas" },
          { label: "Usuários", value: totalUsuarios, icon: Users, color: "text-blue-600 bg-blue-50", href: "/dashboard/usuarios" },
          { label: "Total de chaves", value: totalChaves, icon: Key, color: "text-purple-600 bg-purple-50", href: "/dashboard/chaves" },
          { label: "Resgates hoje", value: resgatesToday, icon: ShoppingBag, color: "text-orange-600 bg-orange-50", href: "/dashboard/resgates" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-emerald-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Lojas recentes</h2>
          <Link href="/dashboard/lojas" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            Ver todas →
          </Link>
        </div>
        {lojasRecentes.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-500 text-sm">
            Nenhuma loja cadastrada ainda.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {lojasRecentes.map((loja) => (
              <div key={loja.id} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{loja.nome}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(loja.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    loja.plano === "ESSENCIAL" ? "bg-gray-100 text-gray-600" :
                    loja.plano === "PROFISSIONAL" ? "bg-blue-50 text-blue-600" :
                    "bg-emerald-50 text-emerald-600"
                  }`}>
                    {loja.plano}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    loja.status === "ATIVA" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  }`}>
                    {loja.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
