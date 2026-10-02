import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { text, requiredText, number, ifSent, ValidationError, validationErrorResponse } from "@/app/lib/validate"

const FUEL_TYPES = ["petrol", "diesel", "electric", "hybrid", "phev"]

function parseDate(val: unknown): Date | null {
  if (!val) return null
  const d = new Date(val as string)
  return isNaN(d.getTime()) ? null : d
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id } = await params
  const vehicle = await prisma.vehicle.findUnique({ where: { id } })
  if (!vehicle || vehicle.clerkId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const { fuelType, motExpiry, lastServiceDate, nextServiceDue } = body

  // Validate — fields not sent stay unchanged (ifSent), as before
  let input
  try {
    input = {
      make: ifSent(body.make, v => requiredText(v, "Make", 50)),
      model: ifSent(body.model, v => requiredText(v, "Model", 50)),
      year: ifSent(body.year, v => requiredText(v, "Year", 4)),
      registration: ifSent(body.registration, v => requiredText(v, "Registration", 12).toUpperCase()),
      colour: text(body.colour, "Colour", 30),
      notes: text(body.notes, "Notes", 2000),
      currentMileage: number(body.currentMileage, "Mileage", { integer: true, max: 2_000_000 }),
    }
    if (input.year !== undefined && !/^\d{4}$/.test(input.year)) throw new ValidationError("Year must be four digits, e.g. 2019")
  } catch (err) {
    const res = validationErrorResponse(err)
    if (res) return res
    throw err
  }

  if (fuelType && !FUEL_TYPES.includes(fuelType)) {
    return NextResponse.json({ error: "Invalid fuel type" }, { status: 400 })
  }

  try {
    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
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
    return NextResponse.json(updated)
  } catch (err) {
    console.error("Vehicle update error:", err)
    return NextResponse.json({ error: "Failed to save vehicle" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id } = await params
  const vehicle = await prisma.vehicle.findUnique({ where: { id } })
  if (!vehicle || vehicle.clerkId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.vehicle.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
