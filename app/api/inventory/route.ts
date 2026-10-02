import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { text, requiredText, email, number, validationErrorResponse } from "@/app/lib/validate"
import { isGarageAccessAllowed } from "@/app/lib/subscription"

async function getGarageId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true } })
  if (!user?.garageId) return null

  const garage = await prisma.garage.findUnique({
    where: { id: user.garageId },
    select: { id: true, subscriptionStatus: true, trialEndsAt: true, subscriptionEnd: true, pastDueAt: true },
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
  // Validate — previously "abc" in a number field became NaN and crashed the insert
  let data
  try {
    data = {
      garageId,
      name: requiredText(body.name, "Name", 100),
      category: text(body.category, "Category", 50),
      quantity: number(body.quantity, "Quantity", { max: 1_000_000 }) ?? 0,
      reorderLevel: number(body.reorderLevel, "Reorder level", { max: 1_000_000 }) ?? 0,
      unit: text(body.unit, "Unit", 20) ?? "units",
      supplier: text(body.supplier, "Supplier", 100),
      supplierEmail: email(body.supplierEmail, "Supplier email"),
      costPrice: number(body.costPrice, "Cost price", { max: 100_000 }),
    }
  } catch (err) {
    const res = validationErrorResponse(err)
    if (res) return res
    throw err
  }

  const part = await prisma.part.create({ data })
  return NextResponse.json(part, { status: 201 })
}
