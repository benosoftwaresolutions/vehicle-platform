import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { sendNewBookingToGarage } from "@/app/lib/email"
import { rateLimit } from "@/app/lib/rateLimit"
import { isGarageAccessAllowed } from "@/app/lib/subscription"
import { getAvailableSlots } from "@/app/lib/slots"
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
    const { garageId, service, date, time, registration, vehicleMake, vehicleModel } = body

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

    // No bookings in the past (compare UTC dates, matching how bookings are stored)
    const todayUtc = new Date(new Date().toISOString().slice(0, 10))
    if (parsedDate < todayUtc) {
      return NextResponse.json({ error: "Booking date cannot be in the past" }, { status: 400 })
    }

    // Garage must exist, be approved, and have an active trial/subscription
    const garageAccess = await prisma.garage.findUnique({
      where: { id: garageId },
      select: { approved: true, subscriptionStatus: true, trialEndsAt: true, subscriptionEnd: true, pastDueAt: true },
    })
    if (!garageAccess || !garageAccess.approved || !isGarageAccessAllowed(garageAccess)) {
      return NextResponse.json({ error: "This garage is not currently taking bookings" }, { status: 400 })
    }

    // Slot must be open with capacity remaining (re-checked server-side to
    // prevent double-booking and requests the UI wouldn't offer)
    const dateStr = parsedDate.toISOString().slice(0, 10)
    const slotResult = await getAvailableSlots(garageId, dateStr)
    if (!slotResult.open || !slotResult.slots.includes(time)) {
      return NextResponse.json({ error: "That time slot is no longer available" }, { status: 409 })
    }

    const booking = await prisma.booking.create({
      data: {
        clerkId: userId,
        garageId,
        service,
        date: new Date(date),
        time,
        registration,
        vehicleMake: vehicleMake?.trim() || null,
        vehicleModel: vehicleModel?.trim() || null,
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
        // Prefer the garage's own bookings inbox; fall back to the owner's
        // account email for garages signed up before it was mandatory.
        garageOwnerEmail: garage.email ?? garageOwner.email,
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