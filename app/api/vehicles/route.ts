import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { isDriverPro, DRIVER_FREE_VEHICLE_LIMIT } from "@/app/lib/subscription"
import { text, requiredText, number, ValidationError, validationErrorResponse } from "@/app/lib/validate"

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
  const { fuelType, motExpiry, lastServiceDate, nextServiceDue } = body

  // Validate everything up front — see app/lib/validate.ts for why
  let input
  try {
    input = {
      make: requiredText(body.make, "Make", 50),
      model: requiredText(body.model, "Model", 50),
      year: requiredText(body.year, "Year", 4),
      registration: requiredText(body.registration, "Registration", 12).toUpperCase(),
      colour: text(body.colour, "Colour", 30),
      notes: text(body.notes, "Notes", 2000),
      currentMileage: number(body.currentMileage, "Mileage", { integer: true, max: 2_000_000 }),
    }
    if (!/^\d{4}$/.test(input.year)) throw new ValidationError("Year must be four digits, e.g. 2019")
  } catch (err) {
    const res = validationErrorResponse(err)
    if (res) return res
    throw err
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

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        clerkId: userId,
        make: input.make,
        model: input.model,
        year: input.year,
        registration: input.registration,
        colour: input.colour,
        fuelType: fuelType || null,
        motExpiry: parseDate(motExpiry),
        lastServiceDate: parseDate(lastServiceDate),
        nextServiceDue: parseDate(nextServiceDue),
        currentMileage: input.currentMileage,
        notes: input.notes,
      },
    })
    return NextResponse.json(vehicle, { status: 201 })
  } catch (err) {
    console.error("Vehicle create error:", err)
    return NextResponse.json({ error: "Failed to save vehicle" }, { status: 500 })
  }
}
