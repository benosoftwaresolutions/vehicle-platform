import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { text, requiredText, email, number, ifSent, validationErrorResponse } from "@/app/lib/validate"

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

  const existing = await prisma.part.findFirst({ where: { id, garageId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  // Same rules as before for missing fields (undefined = keep existing value),
  // but every value that IS sent is now validated
  let data
  try {
    data = {
      name: ifSent(body.name, v => requiredText(v, "Name", 100)) ?? existing.name,
      category: text(body.category, "Category", 50),
      quantity: ifSent(body.quantity, v => number(v, "Quantity", { max: 1_000_000 }) ?? 0) ?? existing.quantity,
      reorderLevel: ifSent(body.reorderLevel, v => number(v, "Reorder level", { max: 1_000_000 }) ?? 0) ?? existing.reorderLevel,
      unit: text(body.unit, "Unit", 20) ?? existing.unit,
      supplier: text(body.supplier, "Supplier", 100),
      supplierEmail: email(body.supplierEmail, "Supplier email"),
      costPrice: ifSent(body.costPrice, v => number(v, "Cost price", { max: 100_000 })) ?? (body.costPrice === undefined ? existing.costPrice : null),
    }
  } catch (err) {
    const res = validationErrorResponse(err)
    if (res) return res
    throw err
  }

  const part = await prisma.part.update({ where: { id }, data })
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
