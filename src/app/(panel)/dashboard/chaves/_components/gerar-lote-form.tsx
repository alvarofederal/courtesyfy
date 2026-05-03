"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { gerarLote } from "../_actions/gerar-lote"
import type { GerarLoteState } from "../_actions/gerar-lote"

type Campanha = { id: string; nome: string; quantidadeChaves: number; chavesGeradas: number }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
    >
      {pending ? "Gerando chaves..." : "Gerar lote"}
    </button>
  )
}

interface Props {
  campanhas: Campanha[]
  campanhaIdPadrão?: string
}

export function GerarLoteForm({ campanhas, campanhaIdPadrão }: Props) {
  const [state, formAction] = useActionState<GerarLoteState, FormData>(gerarLote, {})
  const fe = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      {/* Campanha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Campanha <span className="text-red-500">*</span>
        </label>
        {campanhas.length === 0 ? (
          <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            Nenhuma campanha ativa. Crie e ative uma campanha primeiro.
          </p>
        ) : (
          <select
            name="campanhaId"
            defaultValue={campanhaIdPadrão ?? ""}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="" disabled>
              Selecione uma campanha...
            </option>
            {campanhas.map((c) => {
              const restantes = c.quantidadeChaves - c.chavesGeradas
              return (
                <option key={c.id} value={c.id} disabled={restantes <= 0}>
                  {c.nome} — {restantes > 0 ? `${restantes} vagas` : "limite atingido"}
                </option>
              )
            })}
          </select>
        )}
        {fe.campanhaId && <p className="text-red-500 text-xs mt-1">{fe.campanhaId[0]}</p>}
      </div>

      {/* Quantidade */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Quantidade de chaves <span className="text-red-500">*</span>
        </label>
        <input
          name="quantidade"
          type="number"
          min="1"
          max="2000"
          defaultValue={50}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-gray-400 text-xs mt-1">Máximo 2.000 por lote. Limite respeitado conforme a campanha.</p>
        {fe.quantidade && <p className="text-red-500 text-xs mt-1">{fe.quantidade[0]}</p>}
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Descrição do lote <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          name="descricao"
          type="text"
          placeholder="Ex: Lote para distribuidores de SP — Semana 1"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {fe.descricao && <p className="text-red-500 text-xs mt-1">{fe.descricao[0]}</p>}
      </div>

      <div className="pt-2 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  )
}
