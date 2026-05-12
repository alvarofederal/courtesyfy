"use client"

import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"
import { Copy, Check, Gift, Eye, EyeOff } from "lucide-react"
import { CancelarChaveBtn } from "./cancelar-chave-btn"

type ResgateInfo = {
  beneficioEntregue: string | null
  resgatadoEm: Date
  campanha: {
    tipoBeneficio: string
    valorBeneficio: number | null
    descricaoPremio: string | null
  }
}

type Chave = {
  id: string
  codigo: string
  status: string
  landingUrl: string | null
  resgate: ResgateInfo | null
}

interface Props {
  chaves: Chave[]
}

/* ── helpers ─────────────────────────────────────────────────────── */
function formatBeneficio(r: ResgateInfo): string {
  if (r.beneficioEntregue) return r.beneficioEntregue
  const { tipoBeneficio, valorBeneficio, descricaoPremio } = r.campanha
  switch (tipoBeneficio) {
    case "DESCONTO_PERCENTUAL": return `${valorBeneficio ?? "–"}% off`
    case "DESCONTO_FIXO":       return `R$ ${valorBeneficio?.toFixed(2) ?? "–"} off`
    case "BRINDE":              return `Brinde: ${descricaoPremio ?? "–"}`
    case "SORTEIO":             return `Sorteio: ${descricaoPremio ?? "–"}`
    case "FRETE_GRATIS":        return "Frete Grátis"
    case "CASHBACK":            return `Cashback: R$ ${valorBeneficio?.toFixed(2) ?? "–"}`
    default:                    return tipoBeneficio
  }
}

/* ── sub-componentes ─────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60"
      title="Copiar URL"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-emerald-500" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

/* ── mapa de estilos de status ───────────────────────────────────── */
const statusColors: Record<string, string> = {
  GERADA:     "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60",
  CONSULTADA: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  ATIVADA:    "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
  RESGATADA:  "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  EXPIRADA:   "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
  CANCELADA:  "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/30",
}

const statusLabels: Record<string, string> = {
  GERADA:     "Gerada",
  CONSULTADA: "Consultada",
  ATIVADA:    "Ativada",
  RESGATADA:  "Resgatada",
  EXPIRADA:   "Expirada",
  CANCELADA:  "Cancelada",
}

const STATUS_ATIVAS = ["GERADA", "CONSULTADA", "ATIVADA"]
const STATUS_TERMINAIS = ["RESGATADA", "EXPIRADA", "CANCELADA"]

/* ── componente principal ────────────────────────────────────────── */
export function QrGrid({ chaves }: Props) {
  const [view, setView]         = useState<"tabela" | "qrcodes">("tabela")
  const [showAll, setShowAll]   = useState(false)

  const ativas    = chaves.filter(c => STATUS_ATIVAS.includes(c.status))
  const terminais = chaves.filter(c => STATUS_TERMINAIS.includes(c.status))
  const visíveis  = showAll ? chaves : ativas

  return (
    <div>
      {/* Controles */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        {/* Toggle tabela / QR */}
        <div className="flex gap-1 bg-gray-100 dark:bg-white/[0.05] p-1 rounded-xl">
          {(["tabela", "qrcodes"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                view === v
                  ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70"
              }`}
            >
              {v === "tabela" ? "Tabela" : "QR Codes"}
            </button>
          ))}
        </div>

        {/* Filtro ativas / todas */}
        <button
          onClick={() => setShowAll(s => !s)}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
            showAll
              ? "border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
              : "border-gray-200 dark:border-white/10 dash-subtitle hover:border-gray-300 dark:hover:border-white/20"
          }`}
        >
          {showAll
            ? <><Eye className="w-3.5 h-3.5" />Todas ({chaves.length})</>
            : <><EyeOff className="w-3.5 h-3.5" />Ativas ({ativas.length}){terminais.length > 0 && <span className="ml-1 opacity-60">· {terminais.length} arquivadas</span>}</>
          }
        </button>
      </div>

      {view === "tabela" ? (
        /* ── Vista tabela ── */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.07]">
                <th className="text-left py-2.5 px-3 text-xs font-medium dash-muted uppercase tracking-wide">
                  Código
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium dash-muted uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium dash-muted uppercase tracking-wide">
                  Benefício resgatado
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium dash-muted uppercase tracking-wide hidden sm:table-cell">
                  URL
                </th>
                <th className="py-2.5 px-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {visíveis.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm dash-muted">
                    Todas as chaves deste lote foram resgatadas, expiradas ou canceladas.{" "}
                    <button onClick={() => setShowAll(true)} className="text-emerald-500 font-medium hover:text-emerald-400">
                      Ver todas
                    </button>
                  </td>
                </tr>
              )}
              {visíveis.map((chave) => (
                <tr
                  key={chave.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  {/* Código */}
                  <td className="py-2.5 px-3">
                    <code className="font-mono text-xs bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-white/70 px-2 py-1 rounded">
                      {chave.codigo}
                    </code>
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[chave.status] ?? statusColors.CANCELADA}`}>
                      {statusLabels[chave.status] ?? chave.status}
                    </span>
                  </td>

                  {/* Benefício resgatado */}
                  <td className="py-2.5 px-3">
                    {chave.status === "RESGATADA" && chave.resgate ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <Gift className="w-3 h-3 flex-shrink-0" />
                          {formatBeneficio(chave.resgate)}
                        </span>
                        <span className="text-xs dash-muted">
                          {new Date(chave.resgate.resgatadoEm).toLocaleString("pt-BR", {
                            day: "2-digit", month: "2-digit", year: "2-digit",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs dash-muted">—</span>
                    )}
                  </td>

                  {/* URL */}
                  <td className="py-2.5 px-3 hidden sm:table-cell">
                    {chave.landingUrl && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs dash-muted truncate max-w-[180px]">
                          {chave.landingUrl}
                        </span>
                        <CopyButton text={chave.landingUrl} />
                      </div>
                    )}
                  </td>

                  {/* Ações */}
                  <td className="py-2.5 px-3 text-right">
                    <CancelarChaveBtn chaveId={chave.id} status={chave.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Vista QR Codes ── */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {visíveis.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm dash-muted">
              Nenhuma chave ativa.{" "}
              <button onClick={() => setShowAll(true)} className="text-emerald-500 font-medium hover:text-emerald-400">
                Ver todas
              </button>
            </div>
          )}
          {visíveis.map((chave) => (
            <div
              key={chave.id}
              className="dash-card p-3 flex flex-col items-center gap-2 hover:border-emerald-200 dark:hover:border-emerald-500/30 transition-colors"
            >
              {chave.landingUrl ? (
                <QRCodeSVG
                  value={chave.landingUrl}
                  size={100}
                  bgColor="transparent"
                  fgColor="currentColor"
                  level="M"
                  className="text-gray-900 dark:text-white"
                />
              ) : (
                <div className="w-[100px] h-[100px] bg-gray-100 dark:bg-white/5 rounded flex items-center justify-center dash-muted text-xs">
                  sem URL
                </div>
              )}

              <code className="font-mono text-xs dash-subtitle text-center break-all">
                {chave.codigo}
              </code>

              <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-center ${statusColors[chave.status] ?? statusColors.CANCELADA}`}>
                {statusLabels[chave.status] ?? chave.status}
              </span>

              {chave.status === "RESGATADA" && chave.resgate && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 text-center leading-tight">
                  <Gift className="w-3 h-3 inline mr-0.5" />
                  {formatBeneficio(chave.resgate)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
