const statusConfig = {
  RASCUNHO:  { label: "Rascunho",  className: "bg-gray-100 text-gray-600" },
  ATIVA:     { label: "Ativa",     className: "bg-emerald-50 text-emerald-700" },
  PAUSADA:   { label: "Pausada",   className: "bg-amber-50 text-amber-700" },
  ENCERRADA: { label: "Encerrada", className: "bg-red-50 text-red-700" },
  CANCELADA: { label: "Cancelada", className: "bg-gray-100 text-gray-500" },
} as const

type Status = keyof typeof statusConfig

export function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status] ?? statusConfig.CANCELADA
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
