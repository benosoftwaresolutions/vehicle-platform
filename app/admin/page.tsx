import { prisma } from "@/app/lib/prisma"

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{ background: "#ffffff", borderRadius: 14, padding: "24px", border: "0.5px solid rgba(0,0,0,0.08)" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>{label}</p>
      <p style={{ fontSize: "2.25rem", fontWeight: 700, fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", lineHeight: 1, letterSpacing: "-0.03em" }}>{value}</p>
      {sub && <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginTop: "8px" }}>{sub}</p>}
    </div>
  )
}

export default async function AdminOverview() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalGarages,
    totalUsers,
    totalBookings,
    totalReviews,
    bookingsThisMonth,
    newUsersThisMonth,
  ] = await Promise.all([
    prisma.garage.count(),
    prisma.user.count(),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
  ])

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
          Overview
        </h1>
        <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>Platform-wide stats</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "14px" }}>
        <StatCard label="Total Garages"  value={totalGarages} />
        <StatCard label="Total Users"    value={totalUsers} />
        <StatCard label="Total Bookings" value={totalBookings} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
        <StatCard label="Total Reviews"        value={totalReviews} />
        <StatCard label="Bookings This Month"  value={bookingsThisMonth} sub={now.toLocaleString("default", { month: "long", year: "numeric" })} />
        <StatCard label="New Users This Month" value={newUsersThisMonth} sub={now.toLocaleString("default", { month: "long", year: "numeric" })} />
      </div>
    </div>
  )
}
