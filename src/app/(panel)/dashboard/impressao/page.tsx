import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { Plus, Printer, Clock, CheckCircle2, XCircle, PackageCheck, Truck, Search } from "lucide-react"
import { CancelarSolicitacaoBtn } from "./_components/cancelar-solicitacao-btn"

// ─────────────────────────────────────────
// LABELS / CORES
// ─────────────────────────────────────────

const STATUS_CONFIG = {
  PENDENTE:    { label: "Pendente",    icon: Clock,         color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-50 dark:bg-amber-500/10",   border: "border-amber-200 dark:border-amber-500/20" },
  EM_ANALISE:  { label: "Em análise",  icon: Search,        color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-500/10",     border: "border-blue-200 dark:border-blue-500/20"   },
  APROVADA:    { label: "Aprovada",    icon: CheckCircle2,  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
  REJEITADA:   { label: "Rejeitada",   icon: XCircle,       color: "text-red-600 dark:text-red-400",       bg: "bg-red-50 dark:bg-red-500/10",       border: "border-red-200 dark:border-red-500/20"     },
  IMPRESSA:    { label: "Impressa",    icon: Printer,       color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20" },
  ENTREGUE:    { label: "Entregue",    icon: Truck,         color: "text-gray-600 dark:text-gray-400",     bg: "bg-gray-50 dark:bg-gray-500/10",     border: "border-gray-200 dark:border-gray-500/20"   },
} as const

type StatusKey = keyof typeof STATUS_CONFIG

// ─────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────

export default async function ImpressaoPage() {
  const session = await auth()
  if (!session?.user?.lojaId) redirect("/login")

  const [loja, solicitacoes] = await Promise.all([
    db.loja.findUnique({
      where: { id: session.user.lojaId },
      select: { tipoImpressao: true },
    }),
    db.solicitacaoImpressao.findMany({
      where: { lojaId: session.user.lojaId },
      orderBy: { criadoEm: "desc" },
      include: {
        campanha: { select: { nome: true } },
        lote:     { select: { descricao: true, quantidade: true } },
        layout:   { select: { nome: true, corPrimaria: true } },
      },
    }),
  ])

  const modoPropio = loja?.tipoImpressao === "PROPRIO"

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dash-title">Impressão</h1>
          <p className="dash-subtitle text-sm mt-0.5">
            {modoPropio
              ? "Você está configurado para imprimir por conta própria. Faça o download do PDF nos lotes."
              : "Solicite ao Courtesyfy que imprima e entregue os cards das suas campanhas."}
          </p>
        </div>
        {!modoPropio && (
          <Link
            href="/dashboard/impressao/nova"
            className="inline-flex items-center gap-2 dash-btn-primary text-sm px-4 py-2.5 rounded-xl flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nova solicitação
          </Link>
        )}
      </div>

      {/* Banner modo PROPRIO */}
      {modoPropio && (
        <div className="dash-card p-5 mb-6 flex items-start gap-4 border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/5">
          <Printer className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Modo: Impressão própria
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400/80 mt-0.5">
              Você mesmo imprime os cards. Acesse os lotes em cada campanha e baixe o arquivo PDF gerado.{" "}
              <Link href="/dashboard/configuracoes" className="underline hover:no-underline">
                Mudar para solicitar ao Courtesyfy →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Sem solicitações */}
      {solicitacoes.length === 0 && !modoPropio ? (
        <div className="dash-card p-12 text-center">
          <Printer className="w-10 h-10 mx-auto mb-3 dash-muted" />
          <p className="dash-subtitle text-sm">Nenhuma solicitação de impressão ainda.</p>
          <Link
            href="/dashboard/impressao/nova"
            className="mt-4 inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Criar primeira solicitação
          </Link>
        </div>
      ) : solicitacoes.length === 0 ? null : (
        <div className="space-y-3">
          {solicitacoes.map((sol) => {
            const cfg = STATUS_CONFIG[sol.status as StatusKey] ?? STATUS_CONFIG.PENDENTE
            const Icon = cfg.icon
            const podeCancel = ["PENDENTE", "EM_ANALISE"].includes(sol.status)

            return (
              <div key={sol.id} className="dash-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Layout color swatch */}
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 border border-black/5 dark:border-white/10"
                  style={{ backgroundColor: sol.layout.corPrimaria }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold dash-title truncate">{sol.campanha.nome}</p>
                  <p className="text-xs dash-muted mt-0.5">
                    Layout: {sol.layout.nome} · {sol.quantidadeCards} cards · {sol.folhasEstimadas} folha{sol.folhasEstimadas !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs dash-muted">
                    Solicitado em {new Date(sol.criadoEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>

                {/* Status badge */}
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border flex-shrink-0 ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {cfg.label}
                </div>

                {/* Obs admin */}
                {sol.observacaoAdmin && (
                  <p className="text-xs dash-muted italic sm:max-w-xs truncate">
                    "{sol.observacaoAdmin}"
                  </p>
                )}

                {/* Cancelar */}
                {podeCancel && <CancelarSolicitacaoBtn id={sol.id} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
