import { prisma } from "@/app/lib/prisma"
import BookingsTable from "./BookingsTable"

export default async function AdminBookings() {
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" } })

  // Resolve garage names and customer emails
  const garageIds = [...new Set(bookings.map((b) => b.garageId))]
  const clerkIds  = [...new Set(bookings.map((b) => b.clerkId).filter(Boolean) as string[])]

  const [garages, users] = await Promise.all([
    prisma.garage.findMany({ where: { id: { in: garageIds } }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { clerkId: { in: clerkIds } }, select: { clerkId: true, email: true } }),
  ])

  const garageMap = Object.fromEntries(garages.map((g) => [g.id, g.name]))
  const userMap   = Object.fromEntries(users.map((u) => [u.clerkId, u.email]))

  const rows = bookings.map((b) => ({
    id:            b.id,
    service:       b.service,
    date:          b.date,
    time:          b.time,
    status:        b.status,
    isWalkIn:      b.isWalkIn,
    registration:  b.registration,
    customerEmail: b.clerkId ? (userMap[b.clerkId] ?? null) : null,
    customerName:  b.customerName,
    garageName:    garageMap[b.garageId] ?? "Unknown",
  }))

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Bookings</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>{bookings.length} total</p>
      </div>
      <BookingsTable bookings={rows} />
    </div>
  )
}
