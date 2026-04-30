"use client"

import { useState } from "react"
import confetti from "canvas-confetti"
import { Gift, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CourtesyInfoModal } from "./courtesy-info-modal"

type Plan = "FREE" | "PROFESSIONAL" | "COURTESY" | null | undefined
type SubStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid"
  | null
  | undefined

interface FloatingCourtesyButtonProps {
  hasActiveCourtesy: boolean
  courtesyExpiresAt?: Date | string | null
  daysRemaining?: number
  planType: Plan
  subscriptionStatus: SubStatus
  userRole?: string | null
  placement?: "fixed" | "inline"
}

function shouldRender(plan: Plan, status: SubStatus, role?: string | null): boolean {
  // Nunca exibe para admin
  if (role === "ADMIN") return false
  // Oculta apenas para profissionais pagantes ativos
  if (plan === "PROFESSIONAL" && status === "active") return false
  return true
}

export function FloatingCourtesyButton({
  hasActiveCourtesy,
  courtesyExpiresAt,
  daysRemaining,
  planType,
  subscriptionStatus,
  userRole,
  placement = "inline",
}: FloatingCourtesyButtonProps) {
  const [open, setOpen] = useState(false)

  if (!shouldRender(planType, subscriptionStatus, userRole)) return null

  const handleOpen = () => {
    if (hasActiveCourtesy) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ["#10b981", "#14b8a6", "#059669", "#0d9488"],
        zIndex: 9999,
      })
    }
    setOpen(true)
  }

  const label = hasActiveCourtesy ? "Cortesia Ativa" : "Ganhei uma Cortesia"

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={label}
        className={cn(
          placement === "fixed" && "fixed bottom-6 right-6 z-50",
          "flex items-center gap-2 px-5 py-3 rounded-full",
          "bg-gradient-to-r from-emerald-500 to-teal-600",
          "hover:from-emerald-600 hover:to-teal-700",
          "text-white font-semibold shadow-lg hover:shadow-xl",
          "transition-all hover:scale-105",
          "border-2 border-white/20"
        )}
      >
        {hasActiveCourtesy ? (
          <Sparkles className="w-5 h-5" />
        ) : (
          <Gift className="w-5 h-5" />
        )}
        <span className="hidden sm:inline">{label}</span>
        {hasActiveCourtesy && typeof daysRemaining === "number" && daysRemaining > 0 && (
          <span className="ml-1 text-xs bg-white/25 px-2 py-0.5 rounded-full">
            {daysRemaining}d
          </span>
        )}
      </button>

      <CourtesyInfoModal
        open={open}
        onOpenChange={setOpen}
        hasActiveCourtesy={hasActiveCourtesy}
        expiresAt={courtesyExpiresAt}
        daysRemaining={daysRemaining}
      />
    </>
  )
}
