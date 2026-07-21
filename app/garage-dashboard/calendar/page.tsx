import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { getGarageOwnerContext } from "../layout"
import Link from "next/link"
import CalendarView from "./CalendarView"

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { userId } = await auth()
  const ctx = await getGarageOwnerContext(userId!)
  const garageId = ctx!.garageId!

  const { week } = await searchParams
  const weekOffset = parseInt(week ?? "0", 10) || 0

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7) // Monday ± n weeks
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const bookings = await prisma.booking.findMany({
    where: {
      garageId,
      date: { gte: weekStart, lte: weekEnd },
      status: { in: ["pending", "confirmed"] },
    },
    orderBy: { date: "asc" },
  })

  // Online bookings only store clerkId — pull the customer's name and number so
  // the garage can actually get hold of them from the calendar.
  const clerkIds = [...new Set(bookings.map(b => b.clerkId).filter((id): id is string => !!id))]
  const customers = clerkIds.length
    ? await prisma.user.findMany({
        where: { clerkId: { in: clerkIds } },
        select: { clerkId: true, name: true, phone: true, email: true },
      })
    : []
  const customerByClerkId = Object.fromEntries(customers.map(c => [c.clerkId, c]))

  const serialized = bookings.map(b => {
    const customer = b.clerkId ? customerByClerkId[b.clerkId] : null
    return {
      ...b,
      date: b.date.toISOString(),
      suggestedDate: b.suggestedDate?.toISOString() ?? null,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      jobValue: b.jobValue ?? null,
      vehicleMake: b.vehicleMake ?? null,
      vehicleModel: b.vehicleModel ?? null,
      // Walk-ins carry their own details; online bookings inherit the account's
      customerName: b.customerName ?? customer?.name ?? null,
      customerPhone: b.customerPhone ?? customer?.phone ?? null,
      customerEmail: b.customerEmail ?? customer?.email ?? null,
    }
  })

  return (
    <>
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b6a66", marginBottom: "14px" }}>
            <Link href="/garage-dashboard" style={{ color: "#6b6a66", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ margin: "0 6px" }}>→</span>
            Calendar
          </p>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px" }}>
            Weekly Calendar
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>This week&apos;s confirmed and pending bookings</p>
        </div>
      </div>
      <main className="page-body" style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 32px" }}>
        <CalendarView bookings={serialized} weekStart={weekStart.toISOString()} weekOffset={weekOffset} />
      </main>
    </>
  )
}
