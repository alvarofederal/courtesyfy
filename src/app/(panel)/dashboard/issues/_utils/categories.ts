// Utilitários de apresentação para categorias, status e prioridades de chamados.
// Centraliza labels PT-BR, ícones e cores para manter consistência visual.

import type { TicketCategory, TicketStatus, TicketPriority } from "@/generated/prisma"

export const TICKET_CATEGORIES: { value: TicketCategory; label: string; area: "ACCESS" | "SCHEDULING" | "OTHER"; emoji: string }[] = [
  { value: "ACCESS_LOGIN",            label: "Acesso — Não consigo fazer login",        area: "ACCESS",     emoji: "🔐" },
  { value: "ACCESS_PERMISSION",       label: "Acesso — Permissão / menu bloqueado",     area: "ACCESS",     emoji: "🔐" },
  { value: "SCHEDULING_CREATE",       label: "Agendamento — Erro ao criar",             area: "SCHEDULING", emoji: "📅" },
  { value: "SCHEDULING_EDIT",         label: "Agendamento — Erro ao editar ou cancelar", area: "SCHEDULING", emoji: "📅" },
  { value: "SCHEDULING_VIEW",         label: "Agendamento — Sumiu ou apareceu errado",  area: "SCHEDULING", emoji: "📅" },
  { value: "SCHEDULING_NOTIFICATION", label: "Agendamento — Lembrete ao paciente",      area: "SCHEDULING", emoji: "📅" },
  { value: "OTHER",                   label: "Outro",                                    area: "OTHER",      emoji: "❓" },
]

export function getCategoryLabel(category: TicketCategory): string {
  return TICKET_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

export function getCategoryArea(category: TicketCategory): "ACCESS" | "SCHEDULING" | "OTHER" {
  return TICKET_CATEGORIES.find((c) => c.value === category)?.area ?? "OTHER"
}

export function getCategoryEmoji(category: TicketCategory): string {
  return TICKET_CATEGORIES.find((c) => c.value === category)?.emoji ?? "❓"
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN:         "Aberto",
  IN_PROGRESS:  "Em análise",
  WAITING_USER: "Aguardando você",
  RESOLVED:     "Resolvido",
  CLOSED:       "Fechado",
}

// Cores coerentes com a paleta do app (emerald/amber/blue/orange/stone)
export const TICKET_STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN:         "bg-amber-100 text-amber-800 border-amber-300",
  IN_PROGRESS:  "bg-blue-100 text-blue-800 border-blue-300",
  WAITING_USER: "bg-orange-100 text-orange-800 border-orange-300",
  RESOLVED:     "bg-emerald-100 text-emerald-800 border-emerald-300",
  CLOSED:       "bg-stone-100 text-stone-700 border-stone-300",
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW:    "Baixa",
  NORMAL: "Normal",
  HIGH:   "Alta",
  URGENT: "Urgente",
}

export const TICKET_PRIORITY_COLORS: Record<TicketPriority, string> = {
  LOW:    "bg-gray-100 text-gray-700 border-gray-300",
  NORMAL: "bg-teal-50 text-teal-800 border-teal-200",
  HIGH:   "bg-orange-100 text-orange-800 border-orange-300",
  URGENT: "bg-rose-100 text-rose-800 border-rose-300",
}
