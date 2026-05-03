import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { PrintGrid } from "./_components/print-grid"

type SearchParams = { auto?: string }

export default async function ImprimirLotePage({
  params,
  searchParams,
}: {
  params: Promise<{ loteId: string }>
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (!session?.user?.lojaId) redirect("/login")

  const { loteId } = await params
  const { auto } = await searchParams

  const lote = await db.loteChave.findUnique({
    where: { id: loteId },
    include: { campanha: { select: { nome: true } } },
  })

  if (!lote || lote.lojaId !== session.user.lojaId) notFound()

  const chaves = await db.chave.findMany({
    where: { loteId },
    orderBy: { criadoEm: "asc" },
    select: { codigo: true, landingUrl: true },
  })

  const nomeLote = lote.descricao ?? `Lote de ${chaves.length} chaves`
  const geradoEm = new Date(lote.criadoEm).toLocaleDateString("pt-BR")

  return (
    <PrintGrid
      chaves={chaves}
      campanhaNome={lote.campanha.nome}
      nomeLote={nomeLote}
      totalChaves={chaves.length}
      geradoEm={geradoEm}
      autoPrint={auto === "1"}
    />
  )
}
