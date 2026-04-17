import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function generateSlots(startTime: string, endTime: string, durationMinutes: number): string[] {
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

type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  const { id: garageId } = await params
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date") // expects YYYY-MM-DD

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: "date query param required (YYYY-MM-DD)" }, { status: 400 })
  }

  // Parse as UTC midnight so getUTCDay() matches how bookings are stored
  const date = new Date(`${dateParam}T00:00:00Z`)
  const dayName = DAY_NAMES[date.getUTCDay()]

  const availability = await prisma.garageAvailability.findUnique({
    where: { garageId },
    include: { schedule: true },
  })

  if (!availability) {
    return NextResponse.json({ open: false, reason: "no_availability" })
  }

  const daySchedule = availability.schedule.find((s) => s.day === dayName)

  if (!daySchedule || !daySchedule.isOpen) {
    return NextResponse.json({ open: false, reason: "closed" })
  }

  const allSlots = generateSlots(
    daySchedule.startTime,
    daySchedule.endTime,
    availability.slotDuration
  )

  // Bookings on this date that aren't declined (pending or confirmed)
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

  // Count bookings per slot and filter out any that have reached capacity
  const bookingCounts: Record<string, number> = {}
  for (const b of bookings) {
    bookingCounts[b.time] = (bookingCounts[b.time] ?? 0) + 1
  }

  const availableSlots = allSlots.filter(
    (slot) => (bookingCounts[slot] ?? 0) < availability.capacity
  )

  return NextResponse.json({ open: true, slots: availableSlots })
}
