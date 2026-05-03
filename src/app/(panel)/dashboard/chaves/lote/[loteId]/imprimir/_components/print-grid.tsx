"use client"

import { QRCodeSVG } from "qrcode.react"
import { useEffect } from "react"

type Chave = {
  codigo: string
  landingUrl: string | null
}

interface Props {
  chaves: Chave[]
  campanhaNome: string
  nomeLote: string
  totalChaves: number
  geradoEm: string
  autoPrint?: boolean
}

export function PrintGrid({
  chaves,
  campanhaNome,
  nomeLote,
  totalChaves,
  geradoEm,
  autoPrint,
}: Props) {
  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 600)
      return () => clearTimeout(t)
    }
  }, [autoPrint])

  return (
    <>
      {/* ── Estilos de impressão ── */}
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-page { box-shadow: none !important; }
        }
      `}</style>

      {/* ── Barra de ações (some ao imprimir) ── */}
      <div className="no-print fixed top-0 inset-x-0 z-50 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-medium text-gray-700">{nomeLote}</span>
          <span className="text-xs text-gray-400">· {totalChaves} chaves</span>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* ── Conteúdo imprimível ── */}
      <div className="pt-16 print:pt-0 px-6 pb-8 print:px-0 print:pb-0 bg-white min-h-screen print-page">
        {/* Cabeçalho do documento */}
        <div className="mb-6 print:mb-5 pb-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">{nomeLote}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Campanha: <strong>{campanhaNome}</strong> · {totalChaves} chaves · Gerado em {geradoEm}
          </p>
        </div>

        {/* Grid de cards — 3 colunas em A4 */}
        <div className="grid grid-cols-3 gap-3 print:gap-[4mm]">
          {chaves.map((chave) => (
            <div
              key={chave.codigo}
              className="border border-gray-200 rounded-xl p-3 print:rounded-lg print:p-[3mm] flex flex-col items-center gap-2 print:gap-[2mm] break-inside-avoid"
              style={{ pageBreakInside: "avoid" }}
            >
              {chave.landingUrl ? (
                <QRCodeSVG
                  value={chave.landingUrl}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#111827"
                  level="M"
                  marginSize={1}
                  className="print:w-[32mm] print:h-[32mm]"
                />
              ) : (
                <div className="w-[140px] h-[140px] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                  sem URL
                </div>
              )}
              <code className="font-mono text-xs font-bold tracking-widest text-gray-800 text-center">
                {chave.codigo}
              </code>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          Gerado pelo Courtesyfy
        </div>
      </div>
    </>
  )
}
