import { notFound } from "next/navigation"
import { db } from "@/lib/prisma"
import { AtivacaoForm } from "./_components/ativacao-form"

function daysDiff(to: Date) {
  return Math.ceil((to.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function buildBenefitLabel(
  tipo: string,
  valor: unknown,
  premio: string | null,
): { label: string; destaque: string } {
  if (tipo === "DESCONTO_PERCENTUAL" && valor)
    return { label: "Desconto especial", destaque: `${valor}% OFF` }
  if (tipo === "DESCONTO_FIXO" && valor)
    return { label: "Desconto especial", destaque: `R$ ${Number(valor).toFixed(2)} OFF` }
  if (tipo === "CASHBACK" && valor)
    return { label: "Cashback", destaque: `${valor}% de volta` }
  if (tipo === "FRETE_GRATIS")
    return { label: "Frete Grátis", destaque: "🚚 Frete grátis" }
  if (premio)
    return { label: tipo === "SORTEIO" ? "Sorteio" : "Brinde", destaque: premio }
  return { label: tipo.replace(/_/g, " ").toLowerCase(), destaque: "" }
}

function StatusScreen({
  icon,
  iconBg,
  title,
  message,
  cor,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  message: string
  cor: string
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mini header */}
      <div className="h-2" style={{ backgroundColor: cor }} />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
        </div>
      </div>
      <p className="text-center text-xs text-gray-300 py-4">Powered by Courtesyfy</p>
    </div>
  )
}

export default async function ChaveLandingPage({
  params,
}: {
  params: Promise<{ codigo: string }>
}) {
  const { codigo } = await params

  const chave = await db.chave.findUnique({
    where: { codigo },
    include: {
      campanha: {
        select: {
          nome: true,
          descricao: true,
          tipoBeneficio: true,
          valorBeneficio: true,
          descricaoPremio: true,
          regrasUso: true,
          expiraEm: true,
          status: true,
        },
      },
      loja: {
        select: {
          nome: true,
          nomeExibicao: true,
          logoUrl: true,
          corPrimaria: true,
          siteUrl: true,
        },
      },
    },
  })

  if (!chave) notFound()

  const cor = chave.loja.corPrimaria ?? "#10b981"
  const nomeExibicao = chave.loja.nomeExibicao ?? chave.loja.nome
  const campanha = chave.campanha

  // ── Status screens ──────────────────────────────────────────

  if (campanha.status === "ENCERRADA" || campanha.status === "CANCELADA") {
    return (
      <StatusScreen
        cor={cor}
        iconBg="#FEF3C7"
        icon={
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="Campanha encerrada"
        message="Esta campanha não está mais disponível."
      />
    )
  }

  if (new Date() > campanha.expiraEm) {
    return (
      <StatusScreen
        cor={cor}
        iconBg="#FEF3C7"
        icon={
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="Chave expirada"
        message={`Esta chave era válida até ${new Date(campanha.expiraEm).toLocaleDateString("pt-BR")}.`}
      />
    )
  }

  if (chave.status === "RESGATADA") {
    return (
      <StatusScreen
        cor={cor}
        iconBg="#DCFCE7"
        icon={
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        }
        title="Benefício já utilizado"
        message="Este benefício já foi resgatado. Obrigado por participar!"
      />
    )
  }

  if (chave.status === "EXPIRADA" || chave.status === "CANCELADA") {
    return (
      <StatusScreen
        cor={cor}
        iconBg="#FEE2E2"
        icon={
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        }
        title="Chave inválida"
        message="Esta chave não é mais válida."
      />
    )
  }

  // ── Marcar como CONSULTADA ───────────────────────────────────

  if (chave.status === "GERADA") {
    await db.chave.update({
      where: { id: chave.id },
      data: { status: "CONSULTADA" },
    })
    await db.logEvento.create({
      data: {
        tipoEvento: "CHAVE_CONSULTADA",
        chaveId: chave.id,
        campanhaId: chave.campanhaId,
        lojaId: chave.lojaId,
        canal: "WEB",
      },
    })
  }

  const jaAtivada = chave.status === "ATIVADA"
  const diasRestantes = daysDiff(campanha.expiraEm)
  const { label: beneficioLabel, destaque } = buildBenefitLabel(
    campanha.tipoBeneficio,
    campanha.valorBeneficio,
    campanha.descricaoPremio,
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8fafc" }}>
      {/* ── Header da loja ── */}
      <header style={{ backgroundColor: cor }}>
        <div className="max-w-sm mx-auto px-5 py-5 flex items-center gap-3">
          {chave.loja.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={chave.loja.logoUrl}
              alt={nomeExibicao}
              className="w-11 h-11 rounded-2xl object-cover bg-white/20 flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">{nomeExibicao[0]}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white font-bold text-base leading-tight truncate">{nomeExibicao}</p>
            <p className="text-white/70 text-xs">Cortesia exclusiva para você</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-sm mx-auto w-full px-4 py-5 space-y-4">

        {/* ── Card do benefício ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Área do destaque */}
          <div
            className="px-6 pt-7 pb-6 text-center"
            style={{ background: `linear-gradient(160deg, ${cor}18 0%, ${cor}06 100%)` }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: cor }}>
              {beneficioLabel}
            </p>
            {destaque && (
              <p className="text-4xl font-black text-gray-900 mb-2 leading-tight">{destaque}</p>
            )}
            <p className="text-base font-semibold text-gray-700">{campanha.nome}</p>
            {campanha.descricao && (
              <p className="text-sm text-gray-500 mt-1.5">{campanha.descricao}</p>
            )}
          </div>

          {/* Código */}
          <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Código da chave</p>
              <code className="font-mono text-base font-bold tracking-widest" style={{ color: cor }}>
                {codigo}
              </code>
            </div>
            {/* Validade */}
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-400 mb-0.5">Válido por</p>
              <p className="text-sm font-semibold text-gray-700">
                {diasRestantes === 1 ? "1 dia" : `${diasRestantes} dias`}
              </p>
            </div>
          </div>

          {/* Badge de status */}
          {jaAtivada && (
            <div className="px-6 pb-5 text-center">
              <span
                className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full"
                style={{ backgroundColor: `${cor}15`, color: cor }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cor }} />
                Ativada — pronta para resgatar
              </span>
            </div>
          )}
        </div>

        {/* ── Painel de ação ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {jaAtivada ? (
            <div className="text-center space-y-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${cor}15` }}
              >
                <svg className="w-7 h-7" style={{ color: cor }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Pronto para resgatar!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Mostre este código ao atendente da loja para receber seu benefício.
                </p>
              </div>
              <div
                className="rounded-2xl py-5 px-4"
                style={{ backgroundColor: `${cor}10` }}
              >
                <code
                  className="font-mono text-2xl font-black tracking-widest block"
                  style={{ color: cor }}
                >
                  {codigo}
                </code>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-base font-bold text-gray-900 mb-1">Ativar minha chave</h2>
              <p className="text-xs text-gray-500 mb-5">
                Informe seu contato para ativar. Depois é só apresentar o código ao lojista.
              </p>
              <AtivacaoForm codigo={codigo} corPrimaria={cor} />
            </>
          )}
        </div>

        {/* ── Regras ── */}
        {campanha.regrasUso && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              Regras de uso
            </p>
            <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
              {campanha.regrasUso}
            </p>
          </div>
        )}

      </main>

      <footer className="text-center py-5">
        <p className="text-xs text-gray-300">Powered by Courtesyfy</p>
      </footer>
    </div>
  )
}
