import { prisma } from "./prisma"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function generateSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
  const [startH, startM] = startTime.split(":").map(Number)
  const [endH, endM] = endTime.split(":").map(Number)
  const startMins = startH * 60 + startM
  const endMins = endH * 60 + endM
  const slots: string[] = []
  for (let t = startMins; t + durationMinutes <= endMins; t += durationMinutes) {
    const h = Math.floor(t / 60).toString().padStart(2, "0")
    const m = (t % 60).toString().padStart(2, "0")
    slots.push(`${h}:${m}`)
  }
  return slots
}

/** Current date (YYYY-MM-DD) and time (HH:MM) in UK local time. */
function ukNow(): { date: string; time: string } {
  const now = new Date()
  return {
    date: new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(now),
    time: new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hour12: false }).format(now),
  }
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(date)
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  const asUtc = Date.UTC(+map.year, +map.month - 1, +map.day, +map.hour, +map.minute, +map.second)
  return (asUtc - date.getTime()) / 60_000
}

/**
 * The actual UTC instant of a booking's appointment. `date` is stored as UTC
 * midnight for the calendar day; `time` (HH:MM) is UK local time, so this
 * accounts for the Europe/London offset (GMT/BST) on that specific date.
 */
export function appointmentInstant(date: Date, time: string): Date {
  const [year, month, day] = date.toISOString().slice(0, 10).split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute)
  const offsetMinutes = getTimeZoneOffsetMinutes(new Date(naiveUtc), "Europe/London")
  return new Date(naiveUtc - offsetMinutes * 60_000)
}

export type SlotAvailability =
  | { open: false; reason: "no_availability" | "closed" }
  | { open: true; slots: string[] }

/**
 * Available slots for a garage on a given date (YYYY-MM-DD),
 * accounting for the day's schedule and existing non-declined bookings.
 * Shared by the public slots endpoint and server-side booking validation.
 */
export async function getAvailableSlots(garageId: string, dateParam: string): Promise<SlotAvailability> {
  // Parse as UTC midnight so getUTCDay() matches how bookings are stored
  const date = new Date(`${dateParam}T00:00:00Z`)
  const dayName = DAY_NAMES[date.getUTCDay()]

  // Past dates are never bookable
  const { date: todayUk, time: nowUk } = ukNow()
  if (dateParam < todayUk) return { open: false, reason: "closed" }

  const availability = await prisma.garageAvailability.findUnique({
    where: { garageId },
    include: { schedule: true },
  })

  if (!availability) return { open: false, reason: "no_availability" }

  const daySchedule = availability.schedule.find((s) => s.day === dayName)
  if (!daySchedule || !daySchedule.isOpen) return { open: false, reason: "closed" }

  const allSlots = generateSlots(daySchedule.startTime, daySchedule.endTime, availability.slotDuration)
    // Don't offer times that have already passed today (UK time)
    .filter((slot) => dateParam !== todayUk || slot > nowUk)

  const dayStart = date
  const dayEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000)

  const bookings = await prisma.booking.findMany({
    where: {
      garageId,
      date: { gte: dayStart, lt: dayEnd },
      status: { not: "declined" },
    },
    select: { time: true },
  })

  const bookingCounts: Record<string, number> = {}
  for (const b of bookings) {
    bookingCounts[b.time] = (bookingCounts[b.time] ?? 0) + 1
  }

  // capacity null = no limit; the garage vets each request manually
  const availableSlots = allSlots.filter(
    (slot) => (bookingCounts[slot] ?? 0) < (availability.capacity ?? Infinity)
  )

  return { open: true, slots: availableSlots }
}
