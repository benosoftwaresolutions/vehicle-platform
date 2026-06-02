import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

type Params = { params: Promise<{ id: string }> }

async function verifyGarageOwner(userId: string, garageId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true } })
  return user?.garageId === garageId
}

export async function GET(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id: garageId } = await params
  if (!await verifyGarageOwner(userId, garageId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const registration = searchParams.get("registration")
  if (!registration) return NextResponse.json({ error: "registration required" }, { status: 400 })

  const record = await prisma.customerNote.findUnique({
    where: { garageId_registration: { garageId, registration } },
  })
  return NextResponse.json({ note: record?.note ?? null })
}

export async function PUT(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { id: garageId } = await params
  if (!await verifyGarageOwner(userId, garageId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { registration, note } = await req.json()
  if (!registration) return NextResponse.json({ error: "registration required" }, { status: 400 })

  if (!note || !note.trim()) {
    await prisma.customerNote.deleteMany({ where: { garageId, registration } })
    return NextResponse.json({ note: null })
  }

  const record = await prisma.customerNote.upsert({
    where: { garageId_registration: { garageId, registration } },
    create: { garageId, registration, note: note.trim() },
    update: { note: note.trim() },
  })
  return NextResponse.json({ note: record.note })
}
