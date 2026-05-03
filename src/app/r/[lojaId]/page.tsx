import { notFound } from "next/navigation"
import { db } from "@/lib/prisma"
import { TotemForm } from "./_components/totem-form"

type SearchParams = { codigo?: string }

export default async function TotemPage({
  params,
  searchParams,
}: {
  params: Promise<{ lojaId: string }>
  searchParams: Promise<SearchParams>
}) {
  const { lojaId } = await params
  const { codigo } = await searchParams

  const loja = await db.loja.findUnique({
    where: { id: lojaId },
    select: {
      nome: true,
      nomeExibicao: true,
      logoUrl: true,
      corPrimaria: true,
      status: true,
    },
  })

  if (!loja || loja.status !== "ATIVA") notFound()

  const cor = loja.corPrimaria ?? "#10b981"
  const nomeExibicao = loja.nomeExibicao ?? loja.nome

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f8fafc" }}
    >
      {/* ── Header da loja ── */}
      <header className="flex-shrink-0" style={{ backgroundColor: cor }}>
        <div className="max-w-sm mx-auto px-5 py-6 flex flex-col items-center gap-3 text-center">
          {loja.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={loja.logoUrl}
              alt={nomeExibicao}
              className="w-16 h-16 rounded-2xl object-cover bg-white/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/25 flex items-center justify-center">
              <span className="text-white font-black text-3xl">{nomeExibicao[0]}</span>
            </div>
          )}
          <div>
            <p className="text-white font-bold text-xl leading-tight">{nomeExibicao}</p>
            <p className="text-white/70 text-sm mt-0.5">Resgate seu benefício aqui</p>
          </div>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        <TotemForm
          lojaId={lojaId}
          corPrimaria={cor}
          codigoInicial={codigo}
        />
      </div>

      {/* ── Footer ── */}
      <footer className="text-center py-4">
        <p className="text-xs text-gray-300">Powered by Courtesyfy</p>
      </footer>
    </div>
  )
}
