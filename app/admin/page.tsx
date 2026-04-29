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
    recentBookings,
    recentUsers,
    recentReviews,
  ] = await Promise.all([
    prisma.garage.count(),
    prisma.user.count(),
    prisma.booking.count(),
    prisma.review.count(),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.booking.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, service: true, createdAt: true, garageId: true, registration: true } }),
    prisma.user.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, email: true, role: true, createdAt: true } }),
    prisma.review.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, customerName: true, rating: true, createdAt: true, garageId: true } }),
  ])

  // Resolve garage names for activity feed
  const garageIds = [...new Set([...recentBookings.map((b) => b.garageId), ...recentReviews.map((r) => r.garageId)])]
  const garages = await prisma.garage.findMany({ where: { id: { in: garageIds } }, select: { id: true, name: true } })
  const garageMap = Object.fromEntries(garages.map((g) => [g.id, g.name]))

  // Merge into a single activity feed sorted by date
  const activity = [
    ...recentBookings.map((b) => ({ type: "booking" as const, id: b.id, label: `New booking: ${b.service} (${b.registration})`, sub: garageMap[b.garageId] ?? "Unknown garage", at: b.createdAt })),
    ...recentUsers.map((u) => ({ type: "user" as const, id: u.id, label: `New user: ${u.email}`, sub: u.role, at: u.createdAt })),
    ...recentReviews.map((r) => ({ type: "review" as const, id: r.id, label: `New review: ${"★".repeat(r.rating)} by ${r.customerName}`, sub: garageMap[r.garageId] ?? "Unknown garage", at: r.createdAt })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 15)

  const TYPE_DOT: Record<string, string> = {
    booking: "#111110",
    user:    "#6b6a66",
    review:  "#d4a800",
  }

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
          Overview
        </h1>
        <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>Platform-wide stats</p>
      </div>

      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "14px" }}>
        <StatCard label="Total Garages"  value={totalGarages} />
        <StatCard label="Total Users"    value={totalUsers} />
        <StatCard label="Total Bookings" value={totalBookings} />
      </div>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "32px" }}>
        <StatCard label="Total Reviews"        value={totalReviews} />
        <StatCard label="Bookings This Month"  value={bookingsThisMonth} sub={now.toLocaleString("default", { month: "long", year: "numeric" })} />
        <StatCard label="New Users This Month" value={newUsersThisMonth} sub={now.toLocaleString("default", { month: "long", year: "numeric" })} />
      </div>

      {/* Activity feed */}
      <div>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "14px" }}>
          Recent activity
        </h2>
        <div style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "hidden" }}>
          {activity.length === 0 ? (
            <p style={{ padding: "48px", textAlign: "center", color: "#6b6a66" }}>No activity yet.</p>
          ) : (
            activity.map((item, i) => (
              <div key={item.id + item.type} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 20px", borderBottom: i < activity.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_DOT[item.type], flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#111110", fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</p>
                  <p style={{ color: "#6b6a66", fontSize: "0.78rem" }}>{item.sub}</p>
                </div>
                <p style={{ color: "#6b6a66", fontSize: "0.78rem", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {new Date(item.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} {new Date(item.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
