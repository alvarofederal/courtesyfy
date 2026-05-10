"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { CheckCircle, AlertCircle } from "lucide-react"
import type { AdminAtualizarState } from "../../../../impressao/_actions/impressao-actions"

const STATUS_OPTIONS = [
  { value: "PENDENTE",    label: "Pendente" },
  { value: "EM_ANALISE",  label: "Em análise" },
  { value: "APROVADA",    label: "Aprovada" },
  { value: "REJEITADA",   label: "Rejeitada" },
  { value: "IMPRESSA",    label: "Impressa" },
  { value: "ENTREGUE",    label: "Entregue" },
] as const

const STATUS_COLORS: Record<string, string> = {
  PENDENTE:    "text-amber-600",
  EM_ANALISE:  "text-blue-600",
  APROVADA:    "text-emerald-600",
  REJEITADA:   "text-red-600",
  IMPRESSA:    "text-purple-600",
  ENTREGUE:    "text-gray-500",
}

function SaveBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full dash-btn-primary text-sm px-4 py-2.5 rounded-xl disabled:opacity-50 transition-all"
    >
      {pending ? "Salvando..." : "Atualizar status"}
    </button>
  )
}

export function AdminStatusForm({
  id,
  currentStatus,
  currentObs,
  action,
  aprovadoPor,
  aprovadoEm,
}: {
  id: string
  currentStatus: string
  currentObs: string | null
  action: (prev: AdminAtualizarState, data: FormData) => Promise<AdminAtualizarState>
  aprovadoPor: string | null
  aprovadoEm: Date | null
}) {
  const [state, formAction] = useActionState<AdminAtualizarState, FormData>(action, {})

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      {state.success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-xs">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Status atualizado com sucesso!
        </div>
      )}
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {state.error}
        </div>
      )}

      {/* Status select */}
      <div>
        <label className="block text-xs font-medium dash-subtitle mb-1.5">Novo status</label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="w-full dash-input text-sm px-3 py-2.5 rounded-xl border"
        >
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value} className={STATUS_COLORS[o.value]}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Observação admin */}
      <div>
        <label className="block text-xs font-medium dash-subtitle mb-1.5">
          Observação interna <span className="font-normal dash-muted">(visível ao lojista)</span>
        </label>
        <textarea
          name="observacaoAdmin"
          rows={4}
          maxLength={500}
          defaultValue={currentObs ?? ""}
          placeholder="Ex: Aprovado. Envie o comprovante de pagamento PIX para..."
          className="w-full dash-input text-sm px-3 py-2.5 rounded-xl border resize-none"
        />
      </div>

      <SaveBtn />

      {/* Aprovação info */}
      {aprovadoPor && aprovadoEm && (
        <div className="pt-3 border-t border-gray-100 dark:border-white/5">
          <p className="text-xs dash-muted">
            Aprovado por <span className="font-medium dash-subtitle">{aprovadoPor}</span>{" "}
            em {new Date(aprovadoEm).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </p>
        </div>
      )}
    </form>
  )
}
