import { prisma } from "@/app/lib/prisma"

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  customer:      { bg: "#eff6ff", color: "#1e40af" },
  garage_owner:  { bg: "#fef3c7", color: "#92400e" },
  pending:       { bg: "#f1f5f9", color: "#64748b" },
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
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Users</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>{users.length} registered</p>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #e5e7eb" }}>
              {["Email", "Name", "Role", "Profile", "Bookings", "Joined"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: "0.8rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => {
              const style = ROLE_STYLE[user.role] ?? ROLE_STYLE.pending
              return (
                <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <td style={{ padding: "12px 16px", color: "#0f172a", fontWeight: 500 }}>{user.email}</td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{user.name ?? <span style={{ color: "#d1d5db" }}>—</span>}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: style.bg, color: style.color, padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {user.profileComplete
                      ? <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.8rem" }}>✓ Complete</span>
                      : <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: "0.8rem" }}>Incomplete</span>
                    }
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{bookingMap[user.clerkId] ?? 0}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b", whiteSpace: "nowrap" }}>
                    {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>No users yet.</p>
        )}
      </div>
    </div>
  )
}
