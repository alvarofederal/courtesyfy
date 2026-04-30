import { Sparkles } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CourtesyBadgeHeaderProps {
  code: string
  expiresAt: Date | string
  daysRemaining?: number
}

export function CourtesyBadgeHeader({
  code,
  expiresAt,
  daysRemaining,
}: CourtesyBadgeHeaderProps) {
  const formatted = format(new Date(expiresAt), "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  })

  return (
    <div className="rounded-xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-emerald-900">
            Acesso por Cortesia ativo
          </p>
          <p className="text-xs text-emerald-800 mt-0.5">
            Esta é uma conta gratuita por tempo determinado — acesso completo
            como Profissional. Após a validade, a conta volta ao plano Free.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
            <span className="text-emerald-900">
              <span className="text-emerald-600 font-semibold">Código:</span>{" "}
              <span className="font-mono font-bold">{code}</span>
            </span>
            <span className="text-emerald-900">
              <span className="text-emerald-600 font-semibold">Válida até:</span>{" "}
              <span className="font-semibold">{formatted}</span>
            </span>
            {typeof daysRemaining === "number" && daysRemaining > 0 && (
              <span className="text-emerald-900">
                <span className="text-emerald-600 font-semibold">Restam:</span>{" "}
                <span className="font-semibold">
                  {daysRemaining} {daysRemaining === 1 ? "dia" : "dias"}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
