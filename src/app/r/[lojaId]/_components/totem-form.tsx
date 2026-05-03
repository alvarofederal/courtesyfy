"use client"

import { useActionState, useState, useTransition, useEffect, useRef } from "react"
import { useFormStatus } from "react-dom"
import { consultarChavePublico, confirmarResgatePublico } from "../_actions/resgatar-chave"
import type { ResgatePublicoState } from "../_actions/resgatar-chave"

interface Props {
  lojaId: string
  corPrimaria: string
  codigoInicial?: string
}

function ConfirmarButton({ cor }: { cor: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      style={{ backgroundColor: cor }}
      className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-60 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Confirmando...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Confirmar resgate
        </>
      )}
    </button>
  )
}

function formatarCodigo(valor: string) {
  const limpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const grupos = limpo.match(/.{1,4}/g) ?? []
  return grupos.join("-").slice(0, 19)
}

export function TotemForm({ lojaId, corPrimaria, codigoInicial = "" }: Props) {
  const [codigo, setCodigo] = useState(formatarCodigo(codigoInicial))
  const [consultaResult, setConsultaResult] = useState<ResgatePublicoState | null>(null)
  const [isPending, startTransition] = useTransition()
  const [countdown, setCountdown] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const confirmarAction = confirmarResgatePublico.bind(null, lojaId)
  const [confirmState, formAction] = useActionState<ResgatePublicoState, FormData>(
    confirmarAction,
    {},
  )

  // Auto-buscar se codigoInicial fornecido via URL
  useEffect(() => {
    if (codigoInicial && codigoInicial.replace(/-/g, "").length === 16) {
      handleBuscar(formatarCodigo(codigoInicial))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Countdown + reset automático após sucesso
  useEffect(() => {
    if (!confirmState.success) return
    setCountdown(8)
    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(interval)
          handleReset()
          return 0
        }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmState.success])

  function handleBuscar(cod = codigo) {
    const limpo = cod.replace(/-/g, "")
    if (limpo.length < 16) return
    startTransition(async () => {
      const result = await consultarChavePublico(lojaId, cod)
      setConsultaResult(result)
    })
  }

  function handleReset() {
    setConsultaResult(null)
    setCodigo("")
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const inputStyle =
    "w-full border-2 rounded-2xl px-5 py-4 text-xl font-mono tracking-[0.3em] text-center outline-none transition-all focus:border-[var(--brand)] bg-gray-50 placeholder:tracking-normal placeholder:text-gray-300 placeholder:text-base"

  // ── Tela de sucesso ───────────────────────────────────────────
  if (confirmState.success) {
    const ch = consultaResult?.chave
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center"
        style={{ "--brand": corPrimaria } as React.CSSProperties}
      >
        {/* Ícone de sucesso animado */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mb-6 shadow-lg"
          style={{ backgroundColor: corPrimaria }}
        >
          <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-black text-gray-900 mb-2">Benefício confirmado!</h2>
        <p className="text-gray-500 text-base mb-6">
          O resgate foi realizado com sucesso.
        </p>

        {ch && (
          <div
            className="w-full max-w-xs rounded-3xl p-6 mb-6 text-center"
            style={{ backgroundColor: `${corPrimaria}12` }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: corPrimaria }}>
              {ch.campanhaNome}
            </p>
            <p className="text-2xl font-black text-gray-900">{ch.beneficio}</p>
            {ch.clienteNome && (
              <p className="text-sm text-gray-500 mt-2">Cliente: {ch.clienteNome}</p>
            )}
          </div>
        )}

        {/* Countdown */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Voltando em {countdown}s...
        </div>

        <button
          onClick={handleReset}
          className="text-sm font-medium underline"
          style={{ color: corPrimaria }}
        >
          Validar outra chave agora
        </button>
      </div>
    )
  }

  // ── Confirmação de resgate ────────────────────────────────────
  if (consultaResult?.chave) {
    const ch = consultaResult.chave
    return (
      <div
        className="flex-1 flex flex-col px-5 py-6 space-y-5"
        style={{ "--brand": corPrimaria } as React.CSSProperties}
      >
        <div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Confirmar resgate</h2>
          <p className="text-sm text-gray-500">Verifique os dados abaixo e confirme.</p>
        </div>

        {/* Card do benefício */}
        <div
          className="rounded-3xl p-5"
          style={{ backgroundColor: `${corPrimaria}10`, border: `1.5px solid ${corPrimaria}30` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
              style={{ backgroundColor: corPrimaria }}
            />
            <span className="text-sm font-semibold" style={{ color: corPrimaria }}>
              Chave ativada — válida para resgate
            </span>
          </div>
          <code className="font-mono text-lg font-bold text-gray-800 block mb-1">{ch.codigo}</code>
          <p className="text-sm text-gray-500 mb-1">{ch.campanhaNome}</p>
          <p className="text-2xl font-black text-gray-900">{ch.beneficio}</p>
        </div>

        {/* Dados do cliente */}
        {(ch.clienteNome || ch.clienteTelefone || ch.clienteEmail) && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cliente</p>
            {ch.clienteNome && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {ch.clienteNome}
              </div>
            )}
            {ch.clienteTelefone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {ch.clienteTelefone}
              </div>
            )}
            {ch.clienteEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {ch.clienteEmail}
              </div>
            )}
          </div>
        )}

        {/* Formulário de confirmação */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="codigo" value={ch.codigo} />

          {confirmState.error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm text-center">
              {confirmState.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Observação <span className="text-gray-400 font-normal text-xs">(opcional)</span>
            </label>
            <input
              name="observacao"
              type="text"
              placeholder="Ex: Brinde retirado no balcão"
              className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none transition-all focus:border-[var(--brand)]"
            />
          </div>

          <ConfirmarButton cor={corPrimaria} />
        </form>
      </div>
    )
  }

  // ── Tela inicial: entrada do código ──────────────────────────
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-5 py-8 space-y-6"
      style={{ "--brand": corPrimaria } as React.CSSProperties}
    >
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${corPrimaria}15` }}
        >
          <svg className="w-8 h-8" style={{ color: corPrimaria }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Resgatar benefício</h2>
        <p className="text-gray-500 text-sm">
          Digite ou escaneie o código recebido no seu celular
        </p>
      </div>

      {consultaResult?.error && (
        <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm text-center">
          {consultaResult.error}
        </div>
      )}

      <div className="w-full space-y-3">
        <input
          ref={inputRef}
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(formatarCodigo(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className={inputStyle}
          maxLength={19}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />

        <button
          onClick={() => handleBuscar()}
          disabled={isPending || codigo.replace(/-/g, "").length < 16}
          style={{ backgroundColor: corPrimaria }}
          className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Verificando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Verificar código
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        O código está no seu celular após ativar a chave.
        <br />
        Formato: XXXX-XXXX-XXXX-XXXX
      </p>
    </div>
  )
}
