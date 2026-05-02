const statusConfig = {
  GERADA:     { label: "Gerada",     className: "bg-gray-100 text-gray-600" },
  CONSULTADA: { label: "Consultada", className: "bg-blue-50 text-blue-600" },
  ATIVADA:    { label: "Ativada",    className: "bg-amber-50 text-amber-700" },
  RESGATADA:  { label: "Resgatada",  className: "bg-emerald-50 text-emerald-700" },
  EXPIRADA:   { label: "Expirada",   className: "bg-red-50 text-red-600" },
  CANCELADA:  { label: "Cancelada",  className: "bg-gray-100 text-gray-400" },
} as const

type ChaveStatus = keyof typeof statusConfig

export function ChaveStatusBadge({ status }: { status: ChaveStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.CANCELADA
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}
