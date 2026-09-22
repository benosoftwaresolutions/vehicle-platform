import { prisma } from "@/app/lib/prisma"
import ReviewsTable from "./ReviewsTable"

export default async function AdminReviews() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, garageId: true, clerkId: true, customerName: true, rating: true, comment: true, createdAt: true },
  })

  const garageIds = [...new Set(reviews.map(r => r.garageId))]
  const garages = await prisma.garage.findMany({ where: { id: { in: garageIds } }, select: { id: true, name: true } })
  const garageMap = Object.fromEntries(garages.map(g => [g.id, g.name]))

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
          Reviews
        </h1>
        <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>{reviews.length} total — search to find spam or abusive reviews and remove them</p>
      </div>
      <ReviewsTable
        reviews={reviews.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        garageMap={garageMap}
      />
    </div>
  )
}
