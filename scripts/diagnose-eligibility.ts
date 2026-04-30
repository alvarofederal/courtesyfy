// Diagnostico completo do funil de elegibilidade.
// Roda com: npx tsx scripts/diagnose-eligibility.ts

import prisma from "../src/lib/prisma"

async function main() {
  console.log("\n=== DIAGNOSTICO ELIGIBILITY ===\n")

  // 1) Eventos de tracking
  const trackingCounts = await prisma.trackingEvent.groupBy({
    by: ["event"],
    _count: { _all: true },
  })
  console.log("📊 TrackingEvent por tipo:")
  if (trackingCounts.length === 0) {
    console.log("   ⚠️  ZERO eventos. Ninguem chegou na landing OU codigo nao roda.")
  } else {
    trackingCounts.forEach((t) => console.log(`   ${t.event}: ${t._count._all}`))
  }

  // 2) Ultimos eventos com detalhes
  const lastEvents = await prisma.trackingEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  })
  console.log(`\n📝 Ultimos ${lastEvents.length} eventos:`)
  lastEvents.forEach((e) =>
    console.log(`   ${e.createdAt.toISOString()} | ${e.event} | landing=${e.landing} | cta=${e.cta} | userId=${e.userId ?? "-"}`)
  )

  // 3) CourtesyEligibility (sem include pra nao quebrar se user foi deletado)
  const eligibilitiesRaw = await prisma.courtesyEligibility.findMany({
    orderBy: { createdAt: "desc" },
  })
  const eligibilities = await Promise.all(
    eligibilitiesRaw.map(async (e) => {
      const user = e.userId
        ? await prisma.user.findUnique({
            where: { id: e.userId },
            select: { email: true, name: true },
          })
        : null
      return { ...e, user, displayEmail: e.email ?? user?.email ?? "(sem email)" }
    })
  )
  console.log(`\n🎁 CourtesyEligibility (${eligibilities.length} total):`)
  if (eligibilities.length === 0) {
    console.log("   ⚠️  ZERO eligibilities. Nenhum cadastro vindo de landing.")
    console.log("       Possiveis causas:")
    console.log("       - Usuario nao passou pela /para/medicos antes do cadastro")
    console.log("       - Cookie bm_landing_source nao chegou no servidor")
    console.log("       - Hook em /api/register ou auth.ts signIn nao rodou")
  }
  eligibilities.forEach((e) => {
    const deadlineStr = e.eligibilityDeadline.toISOString()
    const remaining = e.eligibilityDeadline.getTime() - Date.now()
    const remainingH = Math.round((remaining / 1000 / 60 / 60) * 10) / 10
    console.log(
      `   ${e.user?.email ?? e.userId} | landing=${e.landing} | status=${e.status} | deadline=${deadlineStr} (${remainingH}h restantes) | 1oApt=${e.firstAppointmentAt?.toISOString() ?? "—"}`
    )
  })

  // 4) Ultimos appointments com source
  const lastAppts = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { email: true } } },
  })
  console.log(`\n📅 Ultimos ${lastAppts.length} appointments:`)
  lastAppts.forEach((a) =>
    console.log(
      `   ${a.createdAt.toISOString()} | source=${a.source} | profissional=${a.user?.email} | paciente=${a.name}`
    )
  )

  // 5) Cross-check: ha appointments PUBLIC apos um registro com eligibility?
  console.log("\n🔍 Cross-check eligibility x appointments:")
  for (const e of eligibilities) {
    if (!e.userId) {
      console.log(`\n   ${e.displayEmail}: status=${e.status} (sem user vinculado)`)
      continue
    }
    const appts = await prisma.appointment.findMany({
      where: {
        userId: e.userId,
        createdAt: { gte: e.registeredAt },
      },
      select: { id: true, source: true, createdAt: true, name: true },
      orderBy: { createdAt: "asc" },
    })
    console.log(`\n   ${e.user?.email}: status=${e.status}`)
    if (appts.length === 0) {
      console.log("     Nenhum appointment apos cadastro.")
    } else {
      appts.forEach((a) => {
        const withinWindow = a.createdAt <= e.eligibilityDeadline
        const flag = a.source === "PUBLIC" && withinWindow ? "✅ DEVERIA TER VIRADO ELIGIBLE" : a.source !== "PUBLIC" ? "❌ source!=PUBLIC, nao conta" : "❌ fora da janela 48h"
        console.log(`     ${a.createdAt.toISOString()} ${a.source} ${a.name} ${flag}`)
      })
    }
  }

  console.log("\n=== FIM ===\n")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
