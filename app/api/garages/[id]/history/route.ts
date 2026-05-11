import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id: garageId } = await params

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true, role: true } })
  if (!user || user.role !== "garage_owner" || user.garageId !== garageId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 403 })
  }

  const registration = new URL(req.url).searchParams.get("registration")
  if (!registration) return NextResponse.json({ error: "Missing registration" }, { status: 400 })

  const bookings = await prisma.booking.findMany({
    where: { garageId, registration: registration.toUpperCase() },
    orderBy: { date: "desc" },
    select: { id: true, service: true, date: true, status: true, jobValue: true },
    take: 20,
  })

  return NextResponse.json(bookings)
}
