import { notFound } from "next/navigation"
import { db } from "@/lib/prisma"
import { AtivacaoForm } from "./_components/ativacao-form"

const BENEFICIO_LABELS: Record<string, string> = {
  DESCONTO_PERCENTUAL: "Desconto",
  DESCONTO_FIXO:       "Desconto",
  BRINDE:              "Brinde",
  SORTEIO:             "Sorteio",
  FRETE_GRATIS:        "Frete Grátis",
  CASHBACK:            "Cashback",
}

function StatusScreen({
  title,
  message,
  cor,
  emoji,
}: {
  title: string
  message: string
  cor: string
  emoji: string
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-sm w-full text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
          style={{ backgroundColor: `${cor}20` }}
        >
          {emoji}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
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
        },
      },
    },
  })

  if (!chave) notFound()

  const cor = chave.loja.corPrimaria ?? "#10b981"
  const nomeExibicao = chave.loja.nomeExibicao ?? chave.loja.nome
  const campanha = chave.campanha

  // Campanha encerrada/cancelada
  if (campanha.status === "ENCERRADA" || campanha.status === "CANCELADA") {
    return (
      <StatusScreen
        cor={cor}
        emoji="⏰"
        title="Campanha encerrada"
        message="Esta campanha não está mais disponível."
      />
    )
  }

  // Expirada por data
  if (new Date() > campanha.expiraEm) {
    return (
      <StatusScreen
        cor={cor}
        emoji="⏰"
        title="Chave expirada"
        message={`Esta chave era válida até ${new Date(campanha.expiraEm).toLocaleDateString("pt-BR")}.`}
      />
    )
  }

  // Resgatada
  if (chave.status === "RESGATADA") {
    return (
      <StatusScreen
        cor={cor}
        emoji="✅"
        title="Benefício resgatado"
        message="Este benefício já foi utilizado."
      />
    )
  }

  // Cancelada individualmente
  if (chave.status === "EXPIRADA" || chave.status === "CANCELADA") {
    return (
      <StatusScreen
        cor={cor}
        emoji="❌"
        title="Chave inválida"
        message="Esta chave não é mais válida."
      />
    )
  }

  // Marcar como CONSULTADA se ainda estava como GERADA (side-effect no render)
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

  // Formatar o valor do benefício
  let valorExibicao = ""
  if (campanha.tipoBeneficio === "DESCONTO_PERCENTUAL" && campanha.valorBeneficio) {
    valorExibicao = `${campanha.valorBeneficio}% de desconto`
  } else if (campanha.tipoBeneficio === "DESCONTO_FIXO" && campanha.valorBeneficio) {
    valorExibicao = `R$ ${Number(campanha.valorBeneficio).toFixed(2)} de desconto`
  } else if (campanha.tipoBeneficio === "CASHBACK" && campanha.valorBeneficio) {
    valorExibicao = `${campanha.valorBeneficio}% cashback`
  } else if (campanha.tipoBeneficio === "FRETE_GRATIS") {
    valorExibicao = "Frete grátis"
  } else if (campanha.descricaoPremio) {
    valorExibicao = campanha.descricaoPremio
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da loja */}
      <div
        className="px-6 py-5 flex items-center gap-3"
        style={{ backgroundColor: cor }}
      >
        {chave.loja.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={chave.loja.logoUrl}
            alt={nomeExibicao}
            className="w-10 h-10 rounded-xl object-cover bg-white"
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">
            {nomeExibicao[0]}
          </div>
        )}
        <span className="text-white font-bold text-lg">{nomeExibicao}</span>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-4">
        {/* Card do benefício */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div
            className="px-6 pt-6 pb-4 text-center"
            style={{ background: `linear-gradient(135deg, ${cor}15, ${cor}05)` }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: cor }}
            >
              {BENEFICIO_LABELS[campanha.tipoBeneficio] ?? campanha.tipoBeneficio}
            </p>
            {valorExibicao && (
              <p className="text-3xl font-extrabold text-gray-900 mb-1">{valorExibicao}</p>
            )}
            <p className="text-base font-semibold text-gray-700">{campanha.nome}</p>
            {campanha.descricao && (
              <p className="text-sm text-gray-500 mt-1">{campanha.descricao}</p>
            )}
          </div>

          {/* Código da chave */}
          <div className="px-6 py-4 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400 mb-1">Código</p>
            <code
              className="font-mono text-xl font-bold tracking-widest"
              style={{ color: cor }}
            >
              {codigo}
            </code>
          </div>

          {/* Status */}
          {jaAtivada && (
            <div className="px-6 pb-4 text-center">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-sm font-medium px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                Chave ativada — aguardando resgate
              </span>
            </div>
          )}
        </div>

        {/* Validade */}
        <p className="text-center text-xs text-gray-400">
          Válido até {new Date(campanha.expiraEm).toLocaleDateString("pt-BR")}
        </p>

        {/* Formulário de ativação ou mensagem de ativada */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          {jaAtivada ? (
            <div className="text-center space-y-2">
              <p className="font-semibold text-gray-900">Pronto para resgatar!</p>
              <p className="text-sm text-gray-500">
                Apresente este código ao atendente da loja para receber seu benefício.
              </p>
              <code
                className="block font-mono text-2xl font-bold tracking-widest mt-3"
                style={{ color: cor }}
              >
                {codigo}
              </code>
            </div>
          ) : (
            <>
              <h2 className="text-base font-bold text-gray-900 mb-1">Ativar minha chave</h2>
              <p className="text-xs text-gray-500 mb-4">
                Informe seus dados para ativar. Após ativar, apresente o código ao lojista.
              </p>
              <AtivacaoForm codigo={codigo} corPrimaria={cor} />
            </>
          )}
        </div>

        {/* Regras */}
        {campanha.regrasUso && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Regras de uso
            </p>
            <p className="text-xs text-gray-600 whitespace-pre-line">{campanha.regrasUso}</p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-300 pb-4">Powered by Courtesyfy</p>
      </div>
    </div>
  )
}
