import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { PrintGrid } from "./_components/print-grid"

type SearchParams = { auto?: string; formato?: string }

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
  const { auto, formato } = await searchParams
  const printFormat = formato === "mdf" ? "mdf" : "cartao"

  const lote = await db.loteChave.findUnique({
    where: { id: loteId },
    include: {
      campanha: {
        select: {
          nome: true,
          tipoBeneficio: true,
          valorBeneficio: true,
          descricaoPremio: true,
          descricao: true,
          expiraEm: true,
          layout: {
            select: {
              corPrimaria: true,
              imagem1Url: true,
              imagem2Url: true,
              opacidadeFundo: true,
            },
          },
        },
      },
    },
  })

  if (!lote || lote.lojaId !== session.user.lojaId) notFound()

  const loja = await db.loja.findUnique({
    where: { id: session.user.lojaId },
    select: { nome: true, nomeExibicao: true, logoUrl: true, corPrimaria: true },
  })

  if (!loja) notFound()

  // layout da campanha tem prioridade; fallback para dados da loja
  const layoutAtivo = lote.campanha.layout

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
      campanha={{
        nome: lote.campanha.nome,
        tipoBeneficio: lote.campanha.tipoBeneficio,
        valorBeneficio: lote.campanha.valorBeneficio?.toString() ?? null,
        descricaoPremio: lote.campanha.descricaoPremio ?? null,
        descricao: lote.campanha.descricao ?? null,
        expiraEm: lote.campanha.expiraEm.toLocaleDateString("pt-BR"),
      }}
      loja={{
        nome: loja.nomeExibicao ?? loja.nome,
        logoUrl: layoutAtivo?.imagem2Url ?? loja.logoUrl ?? null,
        corPrimaria: layoutAtivo?.corPrimaria ?? loja.corPrimaria,
        imagemFundoUrl: layoutAtivo?.imagem1Url ?? null,
        opacidadeFundo: layoutAtivo?.opacidadeFundo ?? 20,
      }}
      nomeLote={nomeLote}
      totalChaves={chaves.length}
      geradoEm={geradoEm}
      formato={printFormat}
      autoPrint={auto === "1"}
    />
  )
}
