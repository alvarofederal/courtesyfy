"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { ativarChave } from "../_actions/ativar-chave"
import type { AtivarChaveState } from "../_actions/ativar-chave"

function SubmitButton({ cor }: { cor: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ backgroundColor: cor }}
      className="w-full py-3 rounded-2xl text-white font-semibold text-base disabled:opacity-60 transition-opacity"
    >
      {pending ? "Ativando..." : "Ativar minha chave"}
    </button>
  )
}

interface Props {
  codigo: string
  corPrimaria: string
}

export function AtivacaoForm({ codigo, corPrimaria }: Props) {
  const [state, formAction] = useActionState<AtivarChaveState, FormData>(ativarChave, {})
  const fe = state.fieldErrors ?? {}

  if (state.success) {
    return (
      <div className="text-center py-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl"
          style={{ backgroundColor: corPrimaria }}
        >
          ✓
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Chave ativada!</h3>
        <p className="text-gray-600 text-sm">
          Apresente esta tela ou o código ao lojista para resgatar seu benefício.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="codigo" value={codigo} />

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Seu nome <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <input
          name="nome"
          type="text"
          placeholder="Ex: João Silva"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
          style={{ "--tw-ring-color": corPrimaria } as React.CSSProperties}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Telefone <span className="text-gray-500 font-normal text-xs">(ou e-mail)</span>
        </label>
        <input
          name="telefone"
          type="tel"
          placeholder="(11) 99999-9999"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
        />
        {fe.telefone && <p className="text-red-500 text-xs mt-1">{fe.telefone[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          E-mail <span className="text-gray-500 font-normal text-xs">(ou telefone)</span>
        </label>
        <input
          name="email"
          type="email"
          placeholder="seu@email.com"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
        />
        {fe.email && <p className="text-red-500 text-xs mt-1">{fe.email[0]}</p>}
      </div>

      <div className="pt-2">
        <SubmitButton cor={corPrimaria} />
      </div>

      <p className="text-center text-xs text-gray-400">
        Seus dados são usados apenas para identificação do resgate.
      </p>
    </form>
  )
}
