// Rota limpa — fora do layout do dashboard (sem sidebar/header).
// Renderiza os cards em unidades mm (100% vetorial) e auto-dispara window.print().

import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { PrintSheet } from "./_components/print-sheet"

type SearchParams = {
  formato?: string
  keyX?: string
  keyY?: string
  keyColor?: string
  keySize?: string
  modoLimpo?: string
}

export const metadata = { title: "Impressão | Courtesyfy" }

export default async function PrintLotePage({
  params,
  searchParams,
}: {
  params: Promise<{ loteId: string }>
  searchParams: Promise<SearchParams>
}) {
  const session = await auth()
  if (!session?.user?.lojaId) redirect("/login")

  const { loteId } = await params
  const { formato, keyX, keyY, keyColor, keySize, modoLimpo } = await searchParams

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

  const layoutAtivo = lote.campanha.layout

  const chaves = await db.chave.findMany({
    where: { loteId },
    orderBy: { criadoEm: "asc" },
    select: { codigo: true, landingUrl: true },
  })

  const nomeLote = lote.descricao ?? `Lote de ${chaves.length} chaves`
  const geradoEm = new Date(lote.criadoEm).toLocaleDateString("pt-BR")

  // Posição da chave enviada pelo preview (porcentagem 0–100)
  const keyPos =
    keyX && keyY
      ? { x: parseFloat(keyX), y: parseFloat(keyY) }
      : null

  const corLoja = layoutAtivo?.corPrimaria ?? loja.corPrimaria

  return (
    <PrintSheet
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
        corPrimaria: corLoja,
        imagemFundoUrl: layoutAtivo?.imagem1Url ?? null,
        opacidadeFundo: layoutAtivo?.opacidadeFundo ?? 20,
      }}
      formato={printFormat}
      keyPos={keyPos}
      keyColor={keyColor ?? corLoja}
      keySize={keySize ? parseInt(keySize) : 11}
      modoLimpo={modoLimpo === "1"}
      nomeLote={nomeLote}
      totalChaves={chaves.length}
      geradoEm={geradoEm}
    />
  )
}
