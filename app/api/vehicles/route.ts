import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { isDriverPro, DRIVER_FREE_VEHICLE_LIMIT } from "@/app/lib/subscription"

const FUEL_TYPES = ["petrol", "diesel", "electric", "hybrid", "phev"]

function parseDate(val: unknown): Date | null {
  if (!val) return null
  const d = new Date(val as string)
  return isNaN(d.getTime()) ? null : d
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const vehicles = await prisma.vehicle.findMany({
    where: { clerkId: userId },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(vehicles)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const body = await req.json()
  const { make, model, year, registration, colour, fuelType, motExpiry, lastServiceDate, nextServiceDue, currentMileage, notes } = body

  if (!make?.trim() || !model?.trim() || !year?.trim() || !registration?.trim()) {
    return NextResponse.json({ error: "Make, model, year and registration are required" }, { status: 400 })
  }

  // Enforce vehicle limit for free plan
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { plan: true, subscriptionStatus: true, subscriptionEnd: true } })
  if (user && !isDriverPro(user as Parameters<typeof isDriverPro>[0])) {
    const count = await prisma.vehicle.count({ where: { clerkId: userId } })
    if (count >= DRIVER_FREE_VEHICLE_LIMIT) {
      return NextResponse.json({ error: "PLAN_LIMIT", message: "Upgrade to Driver Pro to add more vehicles" }, { status: 403 })
    }
  }
  if (fuelType && !FUEL_TYPES.includes(fuelType)) {
    return NextResponse.json({ error: "Invalid fuel type" }, { status: 400 })
  }
  if (currentMileage !== undefined && currentMileage !== null && (!Number.isInteger(currentMileage) || currentMileage < 0)) {
    return NextResponse.json({ error: "Invalid mileage" }, { status: 400 })
  }

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        clerkId: userId,
        make: make.trim(),
        model: model.trim(),
        year: year.trim(),
        registration: registration.trim().toUpperCase(),
        colour: colour?.trim() || null,
        fuelType: fuelType || null,
        motExpiry: parseDate(motExpiry),
        lastServiceDate: parseDate(lastServiceDate),
        nextServiceDue: parseDate(nextServiceDue),
        currentMileage: currentMileage ?? null,
        notes: notes?.trim() || null,
      },
    })
    return NextResponse.json(vehicle, { status: 201 })
  } catch (err) {
    console.error("Vehicle create error:", err)
    return NextResponse.json({ error: "Failed to save vehicle" }, { status: 500 })
  }
}
