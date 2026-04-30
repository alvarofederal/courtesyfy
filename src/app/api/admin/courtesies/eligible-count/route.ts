// src/app/api/admin/courtesies/eligible-count/route.ts
// Conta cortesias elegiveis aguardando aprovacao + lazy expire.
// Reservado a admin.

export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { expireStaleEligibilities } from "@/lib/courtesy-eligibility"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ pending: 0 })
  }

  // Lazy expire antes de contar (mantem consistencia sem cron)
  await expireStaleEligibilities()

  const pending = await prisma.courtesyEligibility.count({
    where: { status: "ELIGIBLE" },
  })

  return NextResponse.json({ pending })
}
