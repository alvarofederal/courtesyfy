/**
 * Núcleo do agendamento. Toda referência a "intervalo de slot" deve passar por aqui.
 * Quando virar parametrizável (por profissional / typeService), trocar SLOT_INTERVAL_MINUTES
 * por uma função que recebe contexto.
 */

export const SLOT_INTERVAL_MINUTES = 60
export const SCHEDULE_START_HOUR = 7
export const SCHEDULE_END_HOUR = 23

export function generateDayGrid(
  startHour = SCHEDULE_START_HOUR,
  endHour = SCHEDULE_END_HOUR,
  intervalMinutes = SLOT_INTERVAL_MINUTES
): string[] {
  const slots: string[] = []
  const totalMinutes = (endHour - startHour) * 60
  const count = Math.floor(totalMinutes / intervalMinutes) + 1

  for (let i = 0; i < count; i++) {
    const minutesFromStart = i * intervalMinutes
    const hour = startHour + Math.floor(minutesFromStart / 60)
    const min = minutesFromStart % 60
    slots.push(`${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`)
  }

  return slots
}

export function slotsRequiredFor(durationMinutes: number, intervalMinutes = SLOT_INTERVAL_MINUTES): number {
  if (!durationMinutes || durationMinutes <= 0) return 1
  return Math.ceil(durationMinutes / intervalMinutes)
}

export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number)
  const total = h * 60 + m + minutes
  const endH = Math.floor(total / 60)
  const endM = total % 60
  return `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`
}

/**
 * Para legado: arredonda "07:30" → "07:00". Use só em migração de dados antigos.
 */
export function roundDownToHour(time: string): string {
  const [h] = time.split(":")
  return `${h}:00`
}

export function isValidSlotTime(time: string, intervalMinutes = SLOT_INTERVAL_MINUTES): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(time)
  if (!match) return false
  const h = Number(match[1])
  const m = Number(match[2])
  if (h < 0 || h > 23 || m < 0 || m > 59) return false
  return (h * 60 + m) % intervalMinutes === 0
}
