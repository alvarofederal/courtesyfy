"use client"

import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"

interface Props {
  lojaId: string
}

export function TotemLinkCard({ lojaId }: Props) {
  const [origin, setOrigin] = useState("")
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const url = `${origin}/r/${lojaId}`

  function copyUrl() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Fecha modal com Escape
  useEffect(() => {
    if (!qrOpen) return
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setQrOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [qrOpen])

  // Trava scroll do body
  useEffect(() => {
    document.body.style.overflow = qrOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [qrOpen])

  return (
    <>
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
            <div className="flex flex-wrap items-center gap-2">
              <code className="flex-1 min-w-0 text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-600 truncate font-mono">
                {url}
              </code>
              <button
                onClick={copyUrl}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                  copied ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
              <button
                onClick={() => setQrOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3v.01M5 8H4a1 1 0 00-1 1v10a1 1 0 001 1h3m10-3v3m0 0H9m10 0h.01" />
                </svg>
                QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal QR Code ── */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setQrOpen(false) }}
        >
          <div
            ref={modalRef}
            className="relative rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 w-full max-w-xs"
            style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
          >
            {/* Fechar */}
            <button
              onClick={() => setQrOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <p className="text-base font-bold text-gray-900">QR Code do Totem</p>
              <p className="text-xs text-gray-500 mt-1">
                Imprima ou exiba na tela da sua loja
              </p>
            </div>

            {/* QR Code com fundo transparente */}
            <div className="p-3 rounded-2xl" style={{ backgroundColor: "rgba(255,255,255,0.0)" }}>
              {url && (
                <QRCodeSVG
                  value={url}
                  size={220}
                  bgColor="transparent"
                  fgColor="#111827"
                  level="M"
                  marginSize={1}
                />
              )}
            </div>

            <div className="text-center w-full">
              <code className="text-xs text-gray-400 font-mono break-all">{url}</code>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
