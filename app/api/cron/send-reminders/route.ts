import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { sendUpcomingAppointmentReminder } from "@/app/lib/email"
import { appointmentInstant } from "@/app/lib/slots"

export const runtime = "nodejs"
export const maxDuration = 60

const MINUTE = 60_000

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const now = Date.now()

  // Appointments needing a reminder are always within ~13h of now — narrow
  // the query to a day either side so we're not scanning every future booking.
  const rangeStart = new Date(now - 24 * 60 * MINUTE)
  const rangeEnd = new Date(now + 24 * 60 * MINUTE)

  const bookings = await prisma.booking.findMany({
    where: {
      status: "confirmed",
      date: { gte: rangeStart, lte: rangeEnd },
      OR: [{ reminder12hSentAt: null }, { reminder1hSentAt: null }],
    },
  })

  let sent = 0
  let failed = 0

  await Promise.all(bookings.map(async booking => {
    try {
      const minutesUntil = (appointmentInstant(booking.date, booking.time).getTime() - now) / MINUTE

      const due12h = booking.reminder12hSentAt === null && minutesUntil >= 11 * 60 + 45 && minutesUntil <= 12 * 60 + 15
      const due1h = booking.reminder1hSentAt === null && minutesUntil >= 45 && minutesUntil <= 75
      if (!due12h && !due1h) return

      const [customer, garage] = await Promise.all([
        booking.clerkId ? prisma.user.findUnique({ where: { clerkId: booking.clerkId } }) : null,
        prisma.garage.findUnique({ where: { id: booking.garageId }, select: { name: true, address: true, city: true, postcode: true } }),
      ])

      const recipientEmail = customer?.email ?? (booking.isWalkIn ? booking.customerEmail : null)
      const recipientName = customer?.name ?? booking.customerName ?? "Customer"
      if (!recipientEmail || !garage) return

      const emailArgs = {
        customerEmail: recipientEmail,
        customerName: recipientName,
        garageName: garage.name,
        garageAddress: `${garage.address}, ${garage.city}, ${garage.postcode}`,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        registration: booking.registration,
      }

      if (due12h) {
        await sendUpcomingAppointmentReminder({ ...emailArgs, hoursUntil: 12 })
        await prisma.booking.update({ where: { id: booking.id }, data: { reminder12hSentAt: new Date() } })
        sent++
      }
      if (due1h) {
        await sendUpcomingAppointmentReminder({ ...emailArgs, hoursUntil: 1 })
        await prisma.booking.update({ where: { id: booking.id }, data: { reminder1hSentAt: new Date() } })
        sent++
      }
    } catch {
      failed++
    }
  }))

  return NextResponse.json({ sent, failed })
}
