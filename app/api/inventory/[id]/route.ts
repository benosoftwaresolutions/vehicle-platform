import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

async function getGarageId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true } })
  return user?.garageId ?? null
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const garageId = await getGarageId(userId)
  if (!garageId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { name, category, quantity, reorderLevel, unit, supplier, supplierEmail, costPrice } = body

  const existing = await prisma.part.findFirst({ where: { id, garageId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const part = await prisma.part.update({
    where: { id },
    data: {
      name: name?.trim() ?? existing.name,
      category: category?.trim() || null,
      quantity: quantity !== undefined ? Number(quantity) : existing.quantity,
      reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : existing.reorderLevel,
      unit: unit?.trim() || existing.unit,
      supplier: supplier?.trim() || null,
      supplierEmail: supplierEmail?.trim() || null,
      costPrice: costPrice !== undefined ? (costPrice ? Number(costPrice) : null) : existing.costPrice,
    },
  })
  return NextResponse.json(part)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const garageId = await getGarageId(userId)
  if (!garageId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const existing = await prisma.part.findFirst({ where: { id, garageId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.part.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
