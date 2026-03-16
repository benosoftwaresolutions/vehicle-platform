import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { garageId, workingDays, startTime, endTime, slotDuration, capacity } = await req.json()

    const availability = await prisma.garageAvailability.upsert({
      where: { garageId },
      update: { workingDays, startTime, endTime, slotDuration, capacity },
      create: { garageId, workingDays, startTime, endTime, slotDuration, capacity }
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error("Availability error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}