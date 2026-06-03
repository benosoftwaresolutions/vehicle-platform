import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id: garageId } = await params
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim().toLowerCase() ?? ""

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true } })
  if (user?.garageId !== garageId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const bookings = await prisma.booking.findMany({
    where: {
      garageId,
      customerName: { not: null },
      OR: q ? [
        { customerName: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
        { registration: { contains: q, mode: "insensitive" } },
      ] : undefined,
    },
    select: { customerName: true, customerPhone: true, customerEmail: true, registration: true, vehicleMake: true, vehicleModel: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  // Deduplicate by name+phone, keep most recent
  const seen = new Set<string>()
  const unique = bookings.filter(b => {
    const key = `${b.customerName?.toLowerCase()}|${b.customerPhone ?? ""}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 8)

  return NextResponse.json(unique)
}
