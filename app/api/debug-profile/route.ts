import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

// Temporary debug endpoint — DELETE after diagnosing profile crash
export async function GET() {
  const results: Record<string, string> = {}

  try {
    const { userId } = await auth()
    results.auth = userId ? `ok: ${userId.slice(0, 8)}…` : "no userId"

    if (!userId) return NextResponse.json(results)

    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { name: true, email: true, role: true, garageId: true, createdAt: true },
      })
      results.dbUser = dbUser ? `ok: role=${dbUser.role}` : "null"

      if (dbUser?.garageId) {
        try {
          const garage = await prisma.garage.findUnique({ where: { id: dbUser.garageId }, select: { name: true } })
          results.garage = garage ? `ok: ${garage.name}` : "null"
        } catch (e) { results.garage = `error: ${e instanceof Error ? e.message : e}` }

        try {
          const count = await prisma.booking.count({ where: { garageId: dbUser.garageId } })
          results.bookingCount = `ok: ${count}`
        } catch (e) { results.bookingCount = `error: ${e instanceof Error ? e.message : e}` }
      } else {
        try {
          const vehicles = await prisma.vehicle.findMany({ where: { clerkId: userId } })
          results.vehicles = `ok: ${vehicles.length}`
        } catch (e) { results.vehicles = `error: ${e instanceof Error ? e.message : e}` }
      }
    } catch (e) { results.dbUser = `error: ${e instanceof Error ? e.message : e}` }

    try {
      const cu = await currentUser()
      results.currentUser = cu ? `ok: ${cu.firstName}` : "null"
    } catch (e) { results.currentUser = `error: ${e instanceof Error ? e.message : e}` }

  } catch (e) { results.auth = `error: ${e instanceof Error ? e.message : e}` }

  return NextResponse.json(results)
}
