import prisma from "../src/lib/prisma"

async function main() {
  const apptHalfHour = await prisma.appointment.findMany({
    where: { time: { endsWith: ":30" } },
    select: { id: true, userId: true, time: true, appointmentDate: true, name: true, confirmed: true, typeServiceId: true },
    orderBy: [{ userId: "asc" }, { appointmentDate: "asc" }, { time: "asc" }],
  })

  const slotHalfHour = await prisma.availableSlotTime.count({
    where: { time: { endsWith: ":30" } },
  })

  const tsHalf = await prisma.typeService.count({ where: { duration: 30 } })
  const tsOther = await prisma.typeService.findMany({
    where: { NOT: { duration: { in: [30, 60] } } },
    select: { id: true, name: true, duration: true },
  })

  const conflicts: Array<{ userId: string; date: string; roundedTime: string; ids: string[] }> = []
  const groups = new Map<string, string[]>()

  for (const a of apptHalfHour) {
    const hour = a.time.split(":")[0]
    const rounded = `${hour}:00`
    const key = `${a.userId}|${a.appointmentDate.toISOString().slice(0, 10)}|${rounded}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(a.id)
  }

  for (const a of await prisma.appointment.findMany({
    where: { time: { endsWith: ":00" } },
    select: { id: true, userId: true, time: true, appointmentDate: true },
  })) {
    const key = `${a.userId}|${a.appointmentDate.toISOString().slice(0, 10)}|${a.time}`
    if (groups.has(key)) groups.get(key)!.push(a.id)
  }

  for (const [key, ids] of groups) {
    if (ids.length > 1) {
      const [userId, date, roundedTime] = key.split("|")
      conflicts.push({ userId, date, roundedTime, ids })
    }
  }

  console.log(JSON.stringify({
    appointmentsWith30: apptHalfHour.length,
    appointments30Sample: apptHalfHour.slice(0, 10),
    slotTimesWith30: slotHalfHour,
    typeServicesDuration30: tsHalf,
    typeServicesOtherDurations: tsOther,
    roundingConflicts: conflicts.length,
    conflictDetail: conflicts.slice(0, 5),
  }, null, 2))

  await prisma.$disconnect()
}

main()
