import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

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
  const { make, model, year, registration, colour, fuelType, motExpiry, lastServiceDate, nextServiceDue, currentMileage, notes } = body

  if (fuelType && !FUEL_TYPES.includes(fuelType)) {
    return NextResponse.json({ error: "Invalid fuel type" }, { status: 400 })
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data: {
      make: make?.trim(),
      model: model?.trim(),
      year: year?.trim(),
      registration: registration?.trim().toUpperCase(),
      colour: colour?.trim() || null,
      fuelType: fuelType || null,
      motExpiry: parseDate(motExpiry),
      lastServiceDate: parseDate(lastServiceDate),
      nextServiceDue: parseDate(nextServiceDue),
      currentMileage: currentMileage ?? null,
      notes: notes?.trim() || null,
    },
  })

  return NextResponse.json(updated)
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
