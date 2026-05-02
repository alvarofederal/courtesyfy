"use client"

import { useActionState, useState, useTransition } from "react"
import { useFormStatus } from "react-dom"
import { consultarChave, confirmarResgate } from "../_actions/validar-resgate"
import type { ValidarResgateState } from "../_actions/validar-resgate"
import { Search, CheckCircle, User, Phone, Mail } from "lucide-react"

function ConfirmarButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
    >
      {pending ? "Confirmando resgate..." : "Confirmar resgate"}
    </button>
  )
}

export function Validador() {
  const [codigoDigitado, setCodigoDigitado] = useState("")
  const [consultaResult, setConsultaResult] = useState<ValidarResgateState | null>(null)
  const [isPending, startTransition] = useTransition()
  const [confirmState, confirmAction] = useActionState<ValidarResgateState, FormData>(
    confirmarResgate,
    {},
  )

  function formatarCodigo(valor: string) {
    const limpo = valor.toUpperCase().replace(/[^A-Z0-9]/g, "")
    const grupos = limpo.match(/.{1,4}/g) ?? []
    return grupos.join("-").slice(0, 19)
  }

  function handleBuscar() {
    const codigo = codigoDigitado.replace(/-/g, "")
    if (codigo.length < 16) return
    startTransition(async () => {
      const result = await consultarChave(codigoDigitado)
      setConsultaResult(result)
    })
  }

  function handleReset() {
    setConsultaResult(null)
    setCodigoDigitado("")
  }

  // Sucesso na confirmação
  if (confirmState.success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Resgate confirmado!</h3>
        <p className="text-gray-500 text-sm mb-6">O benefício foi entregue com sucesso.</p>
        <button
          onClick={handleReset}
          className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Validar outra chave
        </button>
      </div>
    )
  }

  // Chave encontrada e válida — mostrar confirmação
  if (consultaResult?.chave) {
    const ch = consultaResult.chave
    return (
      <div className="space-y-4">
        {/* Info da chave */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-700 text-sm font-semibold">Chave ativada — pronta para resgate</span>
          </div>
          <p className="font-mono text-lg font-bold text-gray-900 mb-1">{ch.codigo}</p>
          <p className="text-sm text-gray-600 font-medium">{ch.campanhaNome}</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{ch.beneficio}</p>
        </div>

        {/* Dados do cliente */}
        {(ch.clienteNome || ch.clienteTelefone || ch.clienteEmail) && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Cliente
            </p>
            {ch.clienteNome && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {ch.clienteNome}
              </div>
            )}
            {ch.clienteTelefone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {ch.clienteTelefone}
              </div>
            )}
            {ch.clienteEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {ch.clienteEmail}
              </div>
            )}
          </div>
        )}

        {/* Formulário de confirmação */}
        <form action={confirmAction} className="space-y-3">
          <input type="hidden" name="codigo" value={ch.codigo} />

          {confirmState.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
              {confirmState.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Observação <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              name="observacao"
              type="text"
              placeholder="Ex: Brinde retirado no balcão"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <ConfirmarButton />
        </form>

        <button
          onClick={handleReset}
          className="w-full text-sm text-gray-400 hover:text-gray-600 py-2"
        >
          Cancelar
        </button>
      </div>
    )
  }

  // Tela de busca
  return (
    <div className="space-y-4">
      {consultaResult?.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm text-center">
          {consultaResult.error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Código da chave
        </label>
        <input
          type="text"
          value={codigoDigitado}
          onChange={(e) => setCodigoDigitado(formatarCodigo(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg"
          maxLength={19}
          autoFocus
        />
        <p className="text-gray-400 text-xs mt-1 text-center">
          Digite ou cole o código. Pressione Enter para buscar.
        </p>
      </div>

      <button
        onClick={handleBuscar}
        disabled={isPending || codigoDigitado.replace(/-/g, "").length < 16}
        className="w-full bg-black hover:bg-gray-800 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" />
        {isPending ? "Buscando..." : "Buscar chave"}
      </button>
    </div>
  )
}
