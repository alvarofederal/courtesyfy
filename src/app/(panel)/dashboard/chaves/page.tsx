import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { Plus, Key, ArrowRight, Package } from "lucide-react"

const LOTE_STATUS = {
  GERADO:      { label: "Gerado",      className: "bg-gray-100 text-gray-600" },
  EXPORTADO:   { label: "Exportado",   className: "bg-blue-50 text-blue-600" },
  DISTRIBUIDO: { label: "Distribuído", className: "bg-emerald-50 text-emerald-700" },
} as const

type SearchParams = { campanhaId?: string }

export default async function ChavesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (!session?.user?.lojaId) redirect("/login")

  const params = await searchParams
  const campanhaId = params.campanhaId

  const where = {
    lojaId: session.user.lojaId!,
    ...(campanhaId ? { campanhaId } : {}),
  }

  const lotes = await db.loteChave.findMany({
    where,
    orderBy: { criadoEm: "desc" },
    include: {
      campanha: { select: { nome: true, status: true } },
      _count: { select: { chaves: true } },
    },
  })

  // contagens por status de chave por lote
  const loteIds = lotes.map((l) => l.id)
  const statsRaw = await db.chave.groupBy({
    by: ["loteId", "status"],
    where: { loteId: { in: loteIds } },
    _count: true,
  })

  const statsByLote: Record<string, Record<string, number>> = {}
  for (const s of statsRaw) {
    if (!statsByLote[s.loteId]) statsByLote[s.loteId] = {}
    statsByLote[s.loteId][s.status] = s._count
  }

  const campanhaFiltro = campanhaId
    ? await db.campanha.findUnique({
        where: { id: campanhaId },
        select: { nome: true },
      })
    : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chaves</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {campanhaFiltro
              ? `Lotes da campanha: ${campanhaFiltro.nome}`
              : "Todos os lotes de chaves gerados"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {campanhaId && (
            <Link
              href="/dashboard/chaves"
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-xl"
            >
              Ver todos
            </Link>
          )}
          <Link
            href={campanhaId ? `/dashboard/chaves/gerar?campanhaId=${campanhaId}` : "/dashboard/chaves/gerar"}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Gerar lote
          </Link>
        </div>
      </div>

      {/* Lista de lotes */}
      {lotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Nenhum lote gerado</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
            Gere um lote de chaves únicas para distribuir em uma campanha.
          </p>
          <Link
            href={campanhaId ? `/dashboard/chaves/gerar?campanhaId=${campanhaId}` : "/dashboard/chaves/gerar"}
            className="inline-flex items-center gap-2 bg-black text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Gerar primeiro lote
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {lotes.map((lote) => {
              const stats = statsByLote[lote.id] ?? {}
              const resgatadas = stats.RESGATADA ?? 0
              const ativadas = stats.ATIVADA ?? 0
              const geradas = stats.GERADA ?? 0
              const total = lote._count.chaves

              return (
                <Link
                  key={lote.id}
                  href={`/dashboard/chaves/lote/${lote.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  {/* Ícone */}
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">
                        {lote.descricao ?? `Lote de ${total} chaves`}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          LOTE_STATUS[lote.status]?.className ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {LOTE_STATUS[lote.status]?.label ?? lote.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {lote.campanha.nome} ·{" "}
                      {new Date(lote.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  {/* Stats compactos */}
                  <div className="flex items-center gap-4 text-xs flex-shrink-0 hidden sm:flex">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{total}</p>
                      <p className="text-gray-400">total</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-amber-600">{ativadas}</p>
                      <p className="text-gray-400">ativadas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-emerald-600">{resgatadas}</p>
                      <p className="text-gray-400">resgatadas</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-500">{geradas}</p>
                      <p className="text-gray-400">disponíveis</p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
