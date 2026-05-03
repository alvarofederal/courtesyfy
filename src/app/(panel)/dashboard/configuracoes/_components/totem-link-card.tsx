"use client"

import { useState } from "react"

interface Props {
  lojaId: string
}

export function TotemLinkCard({ lojaId }: Props) {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? ""

  const url = `${baseUrl}/r/${lojaId}`
  const [copied, setCopied] = useState(false)

  function copyUrl() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">Link do Totem de Resgate</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">
            Exiba este link em um totem, tablet ou tela da loja para seus clientes resgatarem os benefícios.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-600 truncate font-mono">
              {url}
            </code>
            <button
              onClick={copyUrl}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                copied
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Abrir
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
