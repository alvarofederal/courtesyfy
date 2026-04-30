import type { TicketStatus, TicketPriority } from "@/generated/prisma"
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_COLORS,
} from "../_utils/categories"

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${TICKET_STATUS_COLORS[status]}`}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  )
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${TICKET_PRIORITY_COLORS[priority]}`}
    >
      {TICKET_PRIORITY_LABELS[priority]}
    </span>
  )
}
