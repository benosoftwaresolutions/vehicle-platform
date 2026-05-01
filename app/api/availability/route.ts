import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { garageId, slotDuration, capacity, schedule } = await req.json()

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { garageId: true, role: true },
    })
    if (!user || user.role !== "garage_owner" || user.garageId !== garageId) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 403 })
    }

    if (!Number.isInteger(capacity) || capacity <= 0 || capacity > 100) {
      return NextResponse.json({ error: "Invalid capacity" }, { status: 400 })
    }
    if (!Number.isInteger(slotDuration) || slotDuration <= 0 || slotDuration > 480) {
      return NextResponse.json({ error: "Invalid slot duration" }, { status: 400 })
    }

    const availability = await prisma.garageAvailability.upsert({
      where: { garageId },
      update: {
        slotDuration,
        capacity,
        schedule: {
          deleteMany: {},
          create: schedule
        }
      },
      create: {
        garageId,
        slotDuration,
        capacity,
        schedule: {
          create: schedule
        }
      }
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Availability error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}