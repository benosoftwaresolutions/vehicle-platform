import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    console.log("userId:", userId)

    if (!userId) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
    }

    const body = await req.json()
    console.log("body:", body)

    const { garageId, service, date, time, registration } = body

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

    console.log("booking created:", booking)
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