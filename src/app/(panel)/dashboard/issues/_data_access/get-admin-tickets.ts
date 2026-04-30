import prisma from "@/lib/prisma"
import type { TicketStatus, TicketCategory, TicketPriority } from "@/generated/prisma"

type Area = "ACCESS" | "SCHEDULING" | "OTHER" | "ALL"

interface ListFilters {
  status?: TicketStatus | "ALL"
  category?: TicketCategory | "ALL"
  priority?: TicketPriority | "ALL"
  area?: Area
  search?: string
}

const AREA_CATEGORIES: Record<Exclude<Area, "ALL">, TicketCategory[]> = {
  ACCESS: ["ACCESS_LOGIN", "ACCESS_PERMISSION"],
  SCHEDULING: [
    "SCHEDULING_CREATE",
    "SCHEDULING_EDIT",
    "SCHEDULING_VIEW",
    "SCHEDULING_NOTIFICATION",
  ],
  OTHER: ["OTHER"],
}

/**
 * Lista chamados para o admin, ordem FIFO (mais antigos primeiro).
 * Filtros opcionais por status, categoria, área e busca por nome/email do usuário.
 */
export async function getAdminTickets(filters: ListFilters = {}) {
  const where: Record<string, unknown> = {}

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status
  }
  if (filters.category && filters.category !== "ALL") {
    where.category = filters.category
  } else if (filters.area && filters.area !== "ALL") {
    where.category = { in: AREA_CATEGORIES[filters.area] }
  }
  if (filters.priority && filters.priority !== "ALL") {
    where.priority = filters.priority
  }
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim()
    where.user = {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
      ],
    }
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: { createdAt: "asc" }, // FIFO: mais antigos primeiro
    select: {
      id: true,
      title: true,
      status: true,
      category: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      images: {
        orderBy: { order: "asc" },
        take: 1,
        select: { id: true, url: true },
      },
      _count: { select: { messages: true, images: true } },
    },
  })

  return tickets
}

export type AdminTicketRow = Awaited<ReturnType<typeof getAdminTickets>>[number]

/**
 * Contagens agregadas por área/status para os cards de métricas.
 */
export async function getAdminTicketMetrics() {
  const [accessOpen, schedulingOpen, otherOpen, waitingUser, resolvedToday, total] = await Promise.all([
    prisma.supportTicket.count({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        category: { in: AREA_CATEGORIES.ACCESS },
      },
    }),
    prisma.supportTicket.count({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        category: { in: AREA_CATEGORIES.SCHEDULING },
      },
    }),
    prisma.supportTicket.count({
      where: {
        status: { in: ["OPEN", "IN_PROGRESS"] },
        category: { in: AREA_CATEGORIES.OTHER },
      },
    }),
    prisma.supportTicket.count({ where: { status: "WAITING_USER" } }),
    prisma.supportTicket.count({
      where: {
        status: "RESOLVED",
        updatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.supportTicket.count(),
  ])

  return { accessOpen, schedulingOpen, otherOpen, waitingUser, resolvedToday, total }
}
