import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { ChevronLeft } from "lucide-react"
import { GerarLoteForm } from "../_components/gerar-lote-form"

type SearchParams = { campanhaId?: string }

export default async function GerarLotePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (!session?.user?.lojaId) redirect("/login")

  const params = await searchParams

  const campanhasRaw = await db.campanha.findMany({
    where: {
      lojaId: session.user.lojaId!,
      status: { in: ["ATIVA", "PAUSADA", "RASCUNHO"] },
    },
    orderBy: { criadoEm: "desc" },
    select: {
      id: true,
      nome: true,
      quantidadeChaves: true,
      _count: { select: { chaves: true } },
    },
  })

  const campanhas = campanhasRaw.map((c) => ({
    id: c.id,
    nome: c.nome,
    quantidadeChaves: c.quantidadeChaves,
    chavesGeradas: c._count.chaves,
  }))

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <Link
        href={
          params.campanhaId
            ? `/dashboard/campanhas/${params.campanhaId}`
            : "/dashboard/chaves"
        }
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {params.campanhaId ? "Voltar para campanha" : "Chaves"}
      </Link>

      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gerar lote de chaves</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Cada chave recebe um código único no formato{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
            XXXX-XXXX-XXXX-XXXX
          </code>{" "}
          com QR Code apontando para a landing page da campanha.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <GerarLoteForm campanhas={campanhas} campanhaIdPadrão={params.campanhaId} />
      </div>

      {/* Info sobre os códigos */}
      <div className="mt-4 bg-gray-50 rounded-2xl border border-gray-100 p-4 text-xs text-gray-500 space-y-1">
        <p>
          <strong className="text-gray-700">Formato:</strong> 16 caracteres alfanuméricos sem
          ambiguidade (sem 0/O, 1/I/L), agrupados em 4 blocos de 4.
        </p>
        <p>
          <strong className="text-gray-700">Unicidade:</strong> Gerado com{" "}
          <code className="bg-white px-1 rounded">crypto.randomBytes</code> — colisões verificadas
          automaticamente.
        </p>
        <p>
          <strong className="text-gray-700">QR Code:</strong> Cada chave gera automaticamente um
          QR Code apontando para{" "}
          <code className="bg-white px-1 rounded">/c/[codigo]</code>.
        </p>
      </div>
    </div>
  )
}
