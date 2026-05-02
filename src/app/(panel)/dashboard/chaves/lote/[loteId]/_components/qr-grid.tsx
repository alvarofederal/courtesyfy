"use client"

import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"
import { Copy, Check } from "lucide-react"

type Chave = {
  id: string
  codigo: string
  status: string
  landingUrl: string | null
}

interface Props {
  chaves: Chave[]
}

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
      className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
      title="Copiar URL"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

const statusColors: Record<string, string> = {
  GERADA:     "bg-gray-100 text-gray-600",
  CONSULTADA: "bg-blue-50 text-blue-600",
  ATIVADA:    "bg-amber-50 text-amber-700",
  RESGATADA:  "bg-emerald-50 text-emerald-700",
  EXPIRADA:   "bg-red-50 text-red-600",
  CANCELADA:  "bg-gray-100 text-gray-400",
}

const statusLabels: Record<string, string> = {
  GERADA:     "Gerada",
  CONSULTADA: "Consultada",
  ATIVADA:    "Ativada",
  RESGATADA:  "Resgatada",
  EXPIRADA:   "Expirada",
  CANCELADA:  "Cancelada",
}

export function QrGrid({ chaves }: Props) {
  const [view, setView] = useState<"tabela" | "qrcodes">("tabela")

  return (
    <div>
      {/* Toggle de visualização */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {(["tabela", "qrcodes"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              view === v
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {v === "tabela" ? "Tabela" : "QR Codes"}
          </button>
        ))}
      </div>

      {view === "tabela" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Código
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-400 uppercase tracking-wide hidden sm:table-cell">
                  URL
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {chaves.map((chave) => (
                <tr key={chave.id} className="hover:bg-gray-50">
                  <td className="py-2.5 px-3">
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {chave.codigo}
                    </code>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        statusColors[chave.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {statusLabels[chave.status] ?? chave.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 hidden sm:table-cell">
                    {chave.landingUrl && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400 truncate max-w-[240px]">
                          {chave.landingUrl}
                        </span>
                        <CopyButton text={chave.landingUrl} />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {chaves.map((chave) => (
            <div
              key={chave.id}
              className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-2 hover:border-gray-200 transition-colors"
            >
              {chave.landingUrl ? (
                <QRCodeSVG
                  value={chave.landingUrl}
                  size={100}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              ) : (
                <div className="w-[100px] h-[100px] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">
                  sem URL
                </div>
              )}
              <code className="font-mono text-xs text-gray-600 text-center">
                {chave.codigo}
              </code>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  statusColors[chave.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {statusLabels[chave.status] ?? chave.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
