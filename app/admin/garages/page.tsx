import { prisma } from "@/app/lib/prisma"
import GaragesTable from "./GaragesTable"

export default async function AdminGarages() {
  const garages = await prisma.garage.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, name: true, city: true, rating: true, logoUrl: true, email: true, phone: true, approved: true, createdAt: true } })

  const garageIds = garages.map((g) => g.id)

  const [bookingCounts, reviewCounts, owners] = await Promise.all([
    prisma.booking.groupBy({ by: ["garageId"], where: { garageId: { in: garageIds } }, _count: { id: true } }),
    prisma.review.groupBy({ by: ["garageId"], where: { garageId: { in: garageIds } }, _count: { id: true } }),
    prisma.user.findMany({ where: { garageId: { in: garageIds } }, select: { garageId: true, email: true, role: true, id: true } }),
  ])

  const bookingMap = Object.fromEntries(bookingCounts.map((b) => [b.garageId, b._count.id]))
  const reviewMap  = Object.fromEntries(reviewCounts.map((r)  => [r.garageId,  r._count.id]))
  const ownerMap   = Object.fromEntries(owners.map((o) => [o.garageId!, o]))

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
          Garages
        </h1>
        <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>{garages.length} registered</p>
      </div>
      <GaragesTable garages={garages} bookingMap={bookingMap} reviewMap={reviewMap} ownerMap={ownerMap} />
    </div>
  )
}
