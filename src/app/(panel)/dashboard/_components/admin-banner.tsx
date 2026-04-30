import { ShieldAlert } from "lucide-react"

interface AdminBannerProps {
  subtitle?: string
}

export function AdminBanner({ subtitle = "Você está gerenciando tipos de atendimento do sistema" }: AdminBannerProps) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm px-4 py-3 rounded-lg flex items-center gap-2 shadow-md">
      <ShieldAlert className="w-5 h-5" />
      <div>
        <p className="font-semibold">Modo Administrador</p>
        <p className="text-xs text-purple-100">{subtitle}</p>
      </div>
    </div>
  )
}
