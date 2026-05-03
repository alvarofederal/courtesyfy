"use client"

import { Download } from "lucide-react"

type Chave = {
  codigo: string
  status: string
  landingUrl: string | null
}

interface Props {
  chaves: Chave[]
  nomeLote: string
}

export function ExportarCsv({ chaves, nomeLote }: Props) {
  function handleExport() {
    const header = "codigo,status,url"
    const rows = chaves.map(
      (c) => `${c.codigo},${c.status},${c.landingUrl ?? ""}`,
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${nomeLote.replace(/\s+/g, "-").toLowerCase()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
    >
      <Download className="w-4 h-4" />
      Exportar CSV
    </button>
  )
}
