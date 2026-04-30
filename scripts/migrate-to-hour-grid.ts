import prisma from "../src/lib/prisma"

/**
 * Migra dados pra nova grade de 60min:
 * - TypeService: qualquer duration != 60 vira 60
 * - Appointment: time terminando em :30 vira :00 (arredondamento p/ baixo)
 * - AvailableSlotTime: deleta times com :30 (slots abertos não usados)
 *
 * Idempotente — pode rodar de novo sem dano.
 */

async function main() {
  console.log("=== MIGRATION TO HOUR GRID ===")

  const tsUpdated = await prisma.typeService.updateMany({
    where: { duration: { not: 60 } },
    data: { duration: 60 },
  })
  console.log(`✔ TypeService normalizados para 60min: ${tsUpdated.count}`)

  const half = await prisma.appointment.findMany({
    where: { time: { endsWith: ":30" } },
    select: { id: true, time: true },
  })

  let apptUpdated = 0
  for (const a of half) {
    const hour = a.time.split(":")[0]
    const rounded = `${hour}:00`
    await prisma.appointment.update({
      where: { id: a.id },
      data: { time: rounded },
    })
    apptUpdated++
  }
  console.log(`✔ Appointments arredondados :30 → :00: ${apptUpdated}`)

  const slotsDeleted = await prisma.availableSlotTime.deleteMany({
    where: { time: { endsWith: ":30" } },
  })
  console.log(`✔ AvailableSlotTime :30 removidos: ${slotsDeleted.count}`)

  console.log("=== DONE ===")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
