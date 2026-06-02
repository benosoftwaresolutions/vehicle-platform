import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { isGarageAccessAllowed } from "@/app/lib/subscription"

async function getGarageId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true } })
  if (!user?.garageId) return null

  const garage = await prisma.garage.findUnique({
    where: { id: user.garageId },
    select: { id: true, subscriptionStatus: true, trialEndsAt: true, subscriptionEnd: true },
  })
  if (!garage) return null
  if (!isGarageAccessAllowed(garage)) return null

  return garage.id
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const garageId = await getGarageId(userId)
  if (!garageId) return NextResponse.json({ error: "Not available on your plan" }, { status: 403 })

  const parts = await prisma.part.findMany({ where: { garageId }, orderBy: { name: "asc" } })
  return NextResponse.json(parts)
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const garageId = await getGarageId(userId)
  if (!garageId) return NextResponse.json({ error: "Not available on your plan" }, { status: 403 })

  const body = await req.json()
  const { name, category, quantity, reorderLevel, unit, supplier, supplierEmail, costPrice } = body

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const part = await prisma.part.create({
    data: {
      garageId,
      name: name.trim(),
      category: category?.trim() || null,
      quantity: Number(quantity) || 0,
      reorderLevel: Number(reorderLevel) || 0,
      unit: unit?.trim() || "units",
      supplier: supplier?.trim() || null,
      supplierEmail: supplierEmail?.trim() || null,
      costPrice: costPrice ? Number(costPrice) : null,
    },
  })
  return NextResponse.json(part, { status: 201 })
}
