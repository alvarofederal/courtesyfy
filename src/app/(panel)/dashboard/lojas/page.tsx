import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { Building2, ArrowRight, Search } from "lucide-react"

const PLANO_CFG = {
  ESSENCIAL:    { label: "Essencial",    className: "bg-gray-100 text-gray-600" },
  PROFISSIONAL: { label: "Profissional", className: "bg-blue-50 text-blue-600" },
  EMPRESARIAL:  { label: "Empresarial",  className: "bg-emerald-50 text-emerald-700" },
} as const

const STATUS_CFG = {
  ATIVA:     { label: "Ativa",     className: "bg-emerald-50 text-emerald-700" },
  SUSPENSA:  { label: "Suspensa",  className: "bg-amber-50 text-amber-700" },
  CANCELADA: { label: "Cancelada", className: "bg-red-50 text-red-600" },
} as const

type SearchParams = { q?: string; status?: string }

export default async function LojasAdminPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/dashboard")

  const params = await searchParams
  const q = params.q ?? ""
  const statusFiltro = params.status ?? ""

  const lojas = await db.loja.findMany({
    where: {
      ...(q ? { nome: { contains: q } } : {}),
      ...(statusFiltro ? { status: statusFiltro as never } : {}),
    },
    orderBy: { criadoEm: "desc" },
    include: {
      _count: { select: { usuarios: true, campanhas: true, chaves: true } },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
          <p className="text-gray-500 text-sm mt-0.5">{lojas.length} lojas cadastradas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form className="flex-1 sm:max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {statusFiltro && <input type="hidden" name="status" value={statusFiltro} />}
        </form>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-max">
            {[
              { value: "", label: "Todas" },
              { value: "ATIVA", label: "Ativas" },
              { value: "SUSPENSA", label: "Suspensas" },
            ].map((tab) => (
              <Link
                key={tab.value}
                href={tab.value ? `/dashboard/lojas?status=${tab.value}${q ? `&q=${q}` : ""}` : `/dashboard/lojas${q ? `?q=${q}` : ""}`}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  statusFiltro === tab.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {lojas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma loja encontrada.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {lojas.map((loja) => (
              <Link
                key={loja.id}
                href={`/dashboard/lojas/${loja.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {loja.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={loja.logoUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <Building2 className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm truncate">{loja.nome}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CFG[loja.status]?.className}`}>
                      {STATUS_CFG[loja.status]?.label}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLANO_CFG[loja.plano]?.className}`}>
                      {PLANO_CFG[loja.plano]?.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {loja.email} · Criada {new Date(loja.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs flex-shrink-0 hidden sm:flex">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{loja._count.usuarios}</p>
                    <p className="text-gray-400">usuários</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{loja._count.campanhas}</p>
                    <p className="text-gray-400">campanhas</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">{loja._count.chaves}</p>
                    <p className="text-gray-400">chaves</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
