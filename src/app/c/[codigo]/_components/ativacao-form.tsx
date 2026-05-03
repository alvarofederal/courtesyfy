"use client"

import { useActionState, useState } from "react"
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
      className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-60 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Ativando...
        </>
      ) : (
        "Ativar minha chave"
      )}
    </button>
  )
}

function CopyButton({ text, cor }: { text: string; cor: string }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-3 w-full py-2.5 rounded-xl border text-sm font-medium transition-colors"
      style={{
        borderColor: cor,
        color: copied ? "#fff" : cor,
        backgroundColor: copied ? cor : "transparent",
      }}
    >
      {copied ? "✓ Código copiado!" : "Copiar código"}
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

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-shadow focus:border-transparent focus:shadow-[0_0_0_2px_var(--brand)]"

  if (state.success) {
    return (
      <div className="text-center py-2 space-y-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: `${corPrimaria}18` }}
        >
          <svg
            className="w-7 h-7"
            style={{ color: corPrimaria }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900">Chave ativada!</h3>
          <p className="text-sm text-gray-500 mt-1">
            Mostre este código ao atendente para receber seu benefício.
          </p>
        </div>

        <div
          className="rounded-2xl py-5 px-4"
          style={{ backgroundColor: `${corPrimaria}10` }}
        >
          <code
            className="font-mono text-2xl font-black tracking-widest block"
            style={{ color: corPrimaria }}
          >
            {codigo}
          </code>
        </div>

        <CopyButton text={codigo} cor={corPrimaria} />
      </div>
    )
  }

  return (
    <form
      action={formAction}
      className="space-y-4"
      style={{ "--brand": corPrimaria } as React.CSSProperties}
    >
      <input type="hidden" name="codigo" value={codigo} />

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm text-center">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Seu nome <span className="text-gray-400 font-normal text-xs">(opcional)</span>
        </label>
        <input
          name="nome"
          type="text"
          placeholder="Ex: João Silva"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Telefone <span className="text-gray-500 font-normal text-xs">(ou e-mail — obrigatório um)</span>
        </label>
        <input
          name="telefone"
          type="tel"
          placeholder="(11) 99999-9999"
          className={inputClass}
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
          className={inputClass}
        />
        {fe.email && <p className="text-red-500 text-xs mt-1">{fe.email[0]}</p>}
      </div>

      <div className="pt-1">
        <SubmitButton cor={corPrimaria} />
      </div>

      <p className="text-center text-xs text-gray-400">
        Seus dados são usados apenas para identificação do resgate.
      </p>
    </form>
  )
}
