import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { sendAppointmentReminder } from "@/app/lib/email"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 0, 0, 0)
  const end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59)

  const bookings = await prisma.booking.findMany({
    where: {
      status: "confirmed",
      date: { gte: start, lte: end },
    },
  })

  let sent = 0
  let failed = 0

  await Promise.all(bookings.map(async booking => {
    try {
      const [customer, garage] = await Promise.all([
        booking.clerkId ? prisma.user.findUnique({ where: { clerkId: booking.clerkId } }) : null,
        prisma.garage.findUnique({ where: { id: booking.garageId }, select: { name: true, address: true, city: true, postcode: true } }),
      ])

      const recipientEmail = customer?.email ?? (booking.isWalkIn ? booking.customerEmail : null)
      const recipientName = customer?.name ?? booking.customerName ?? "Customer"

      if (!recipientEmail || !garage) return

      await sendAppointmentReminder({
        customerEmail: recipientEmail,
        customerName: recipientName,
        garageName: garage.name,
        garageAddress: `${garage.address}, ${garage.city}, ${garage.postcode}`,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        registration: booking.registration,
      })
      sent++
    } catch {
      failed++
    }
  }))

  return NextResponse.json({ sent, failed })
}
