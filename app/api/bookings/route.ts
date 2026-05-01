import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { sendNewBookingToGarage } from "@/app/lib/email"
import { rateLimit } from "@/app/lib/rateLimit"
import { headers } from "next/headers"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
    if (!await rateLimit(`bookings:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await req.json()
    const { garageId, service, date, time, registration } = body

    if (!garageId || !service?.trim() || !date || !time || !registration?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (service.length > 100 || registration.length > 20) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }
    const parsedDate = new Date(date)
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }

    const booking = await prisma.booking.create({
      data: {
        clerkId: userId,
        garageId,
        service,
        date: new Date(date),
        time,
        registration,
        status: "pending"
      }
    })

    // Send email notification to garage owner
    const [customer, garage, garageOwner] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId: userId } }),
      prisma.garage.findUnique({ where: { id: garageId } }),
      prisma.user.findFirst({ where: { garageId, role: "garage_owner" } }),
    ])

    if (customer && garage && garageOwner) {
      await sendNewBookingToGarage({
        garageOwnerEmail: garageOwner.email,
        garageName: garage.name,
        customerName: customer.name ?? customer.email,
        customerEmail: customer.email,
        service,
        date: new Date(date),
        time,
        registration,
        bookingId: booking.id,
      }).catch((err) => console.error("Failed to send booking email:", err))
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { clerkId: userId }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}