import { LifeBuoy } from "lucide-react"
import prisma from "@/lib/prisma"
import { getUserTickets } from "../_data_access/get-user-tickets"
import { TicketsModal } from "./tickets-modal"

interface FloatingTicketButtonProps {
  userId: string
}

/**
 * Server Component que busca a lista inicial de chamados do usuário
 * e renderiza o botão que abre o modal.
 * Projetado para ser colocado ao lado do FloatingCourtesyButton no perfil.
 */
export async function FloatingTicketButton({ userId }: FloatingTicketButtonProps) {
  const [tickets, user] = await Promise.all([
    getUserTickets(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { subscription: { select: { plan: true } } },
    }),
  ])

  const openCount = tickets.filter(
    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "WAITING_USER"
  ).length
  const waitingCount = tickets.filter((t) => t.status === "WAITING_USER").length

  const trigger = (
    <button
      type="button"
      aria-label="Abrir Chamado"
      className="relative flex items-center gap-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 shadow-lg transition-colors"
    >
      <LifeBuoy className="w-5 h-5" />
      <span className="text-sm font-semibold hidden sm:inline">Abrir Chamado</span>
      {waitingCount > 0 ? (
        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {waitingCount}
        </span>
      ) : openCount > 0 ? (
        <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {openCount}
        </span>
      ) : null}
    </button>
  )

  return (
    <TicketsModal
      userId={userId}
      userPlan={user?.subscription?.plan ?? null}
      initialTickets={tickets}
      trigger={trigger}
    />
  )
}
