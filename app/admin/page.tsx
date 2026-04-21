import { prisma } from "@/app/lib/prisma"

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{ background: "white", borderRadius: "14px", padding: "24px", border: "1px solid #e5e7eb" }}>
      <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "6px" }}>{sub}</p>}
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
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Overview</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Platform-wide stats</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "16px" }}>
        <StatCard label="Total Garages"  value={totalGarages} />
        <StatCard label="Total Users"    value={totalUsers} />
        <StatCard label="Total Bookings" value={totalBookings} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <StatCard label="Total Reviews"       value={totalReviews} />
        <StatCard label="Bookings This Month" value={bookingsThisMonth} sub={now.toLocaleString("default", { month: "long", year: "numeric" })} />
        <StatCard label="New Users This Month" value={newUsersThisMonth} sub={now.toLocaleString("default", { month: "long", year: "numeric" })} />
      </div>
    </div>
  )
}
