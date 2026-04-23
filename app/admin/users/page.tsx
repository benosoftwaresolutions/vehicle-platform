import { prisma } from "@/app/lib/prisma"

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  customer:     { bg: "#f4f3ef", color: "#444441" },
  garage_owner: { bg: "#111110", color: "#ffffff" },
  pending:      { bg: "#eceae4", color: "#6b6a66" },
}

export default async function AdminUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } })

  const bookingCounts = await prisma.booking.groupBy({
    by: ["clerkId"],
    where: { clerkId: { in: users.map((u) => u.clerkId), not: null } },
    _count: { id: true },
  })
  const bookingMap = Object.fromEntries(bookingCounts.map((b) => [b.clerkId!, b._count.id]))

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
          Users
        </h1>
        <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>{users.length} registered</p>
      </div>

      <div style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f4f3ef", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
              {["Email", "Name", "Role", "Profile", "Bookings", "Joined"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#444441", fontSize: "0.75rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => {
              const style = ROLE_STYLE[user.role] ?? ROLE_STYLE.pending
              return (
                <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                  <td style={{ padding: "12px 16px", color: "#111110", fontWeight: 500 }}>{user.email}</td>
                  <td style={{ padding: "12px 16px", color: "#444441" }}>{user.name ?? <span style={{ color: "#d1d0cb" }}>—</span>}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: style.bg, color: style.color, padding: "3px 10px", borderRadius: 100, fontSize: "0.73rem", fontWeight: 700 }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {user.profileComplete
                      ? <span style={{ color: "#111110", fontWeight: 600, fontSize: "0.8rem" }}>Complete</span>
                      : <span style={{ color: "#6b6a66", fontWeight: 600, fontSize: "0.8rem" }}>Incomplete</span>
                    }
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b6a66" }}>{bookingMap[user.clerkId] ?? 0}</td>
                  <td style={{ padding: "12px 16px", color: "#6b6a66", whiteSpace: "nowrap" }}>
                    {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p style={{ padding: "48px", textAlign: "center", color: "#6b6a66" }}>No users yet.</p>
        )}
      </div>
    </div>
  )
}
