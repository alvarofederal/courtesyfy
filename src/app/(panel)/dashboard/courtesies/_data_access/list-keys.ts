import prisma from "@/lib/prisma"

export type KeyStatus = "generated" | "printed" | "redeemed" | "expired" | "archived"

export interface KeyFilters {
  batchId?: string
  status?: KeyStatus
}

export interface KeyRow {
  id: string
  maskedCode: string
  batchId: string | null
  validUntil: Date
  printedAt: Date | null
  redeemedAt: Date | null
  redeemedByUserId: string | null
  redemptionSource: string | null
  archivedAt: Date | null
  createdAt: Date
  status: KeyStatus
  canReveal: boolean
}

function computeStatus(key: {
  printedAt: Date | null
  redeemedAt: Date | null
  validUntil: Date
  archivedAt: Date | null
}): KeyStatus {
  if (key.archivedAt) return "archived"
  if (key.redeemedAt) return "redeemed"
  if (key.validUntil <= new Date()) return "expired"
  if (key.printedAt) return "printed"
  return "generated"
}

function mask(code: string): string {
  return code.replace(/[A-Z0-9]/g, "•")
}

export async function listKeys(filters: KeyFilters = {}): Promise<KeyRow[]> {
  const now = new Date()
  const where: Record<string, unknown> = {}
  if (filters.batchId) where.batchId = filters.batchId

  if (filters.status === "archived") {
    where.archivedAt = { not: null }
  } else {
    // Por padrão (e em qualquer outro filtro), esconde as arquivadas.
    where.archivedAt = null

    if (filters.status === "redeemed") {
      where.redeemedAt = { not: null }
    } else if (filters.status === "expired") {
      where.redeemedAt = null
      where.validUntil = { lte: now }
    } else if (filters.status === "printed") {
      where.redeemedAt = null
      where.printedAt = { not: null }
      where.validUntil = { gt: now }
    } else if (filters.status === "generated") {
      where.redeemedAt = null
      where.printedAt = null
      where.validUntil = { gt: now }
    }
  }

  const keys = await prisma.courtesyKey.findMany({
    where,
    orderBy: [{ batchId: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      code: true,
      batchId: true,
      validUntil: true,
      printedAt: true,
      redeemedAt: true,
      redeemedByUserId: true,
      redemptionSource: true,
      archivedAt: true,
      createdAt: true,
    },
  })

  return keys.map((k) => {
    const status = computeStatus(k)
    return {
      id: k.id,
      maskedCode: mask(k.code),
      batchId: k.batchId,
      validUntil: k.validUntil,
      printedAt: k.printedAt,
      redeemedAt: k.redeemedAt,
      redeemedByUserId: k.redeemedByUserId,
      redemptionSource: k.redemptionSource,
      archivedAt: k.archivedAt,
      createdAt: k.createdAt,
      status,
      canReveal: status === "generated",
    }
  })
}

export async function listBatches(): Promise<{ batchId: string; count: number; createdAt: Date }[]> {
  const batches = await prisma.courtesyKey.groupBy({
    by: ["batchId"],
    _count: { _all: true },
    _min: { createdAt: true },
    orderBy: { _min: { createdAt: "desc" } },
  })
  return batches
    .filter((b) => b.batchId)
    .map((b) => ({
      batchId: b.batchId!,
      count: b._count._all,
      createdAt: b._min.createdAt ?? new Date(),
    }))
}

export async function getKeysByIds(ids: string[]) {
  return prisma.courtesyKey.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      code: true,
      validUntil: true,
      printedAt: true,
      redeemedAt: true,
      batchId: true,
    },
  })
}
