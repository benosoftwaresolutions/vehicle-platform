import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { sendMotReminder, sendServiceReminder } from "@/app/lib/email"

export const runtime = "nodejs"
export const maxDuration = 60

// Send reminders at 30, 14, and 7 days before MOT/service due date
const REMINDER_DAYS = [30, 14, 7]

function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Furthest window we care about is 30 days out
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 31)

  const vehicles = await prisma.vehicle.findMany({
    where: {
      OR: [
        { motExpiry: { gte: today, lte: maxDate } },
        { nextServiceDue: { gte: today, lte: maxDate } },
      ],
    },
    include: {
      user: { select: { email: true, name: true } },
    },
  })

  let motSent = 0, serviceSent = 0, failed = 0

  await Promise.all(vehicles.map(async vehicle => {
    const { user, motExpiry, nextServiceDue, registration, make, model } = vehicle
    if (!user?.email) return

    const customerName = user.name ?? "there"

    // MOT reminder
    if (motExpiry) {
      const days = daysBetween(today, motExpiry)
      if (REMINDER_DAYS.includes(days)) {
        try {
          await sendMotReminder({
            customerEmail: user.email,
            customerName,
            registration,
            make,
            model,
            motExpiry,
            daysUntilExpiry: days,
          })
          motSent++
        } catch {
          failed++
        }
      }
    }

    // Service reminder
    if (nextServiceDue) {
      const days = daysBetween(today, nextServiceDue)
      if (REMINDER_DAYS.includes(days)) {
        try {
          await sendServiceReminder({
            customerEmail: user.email,
            customerName,
            registration,
            make,
            model,
            nextServiceDue,
            daysUntilService: days,
          })
          serviceSent++
        } catch {
          failed++
        }
      }
    }
  }))

  return NextResponse.json({ motSent, serviceSent, failed })
}
