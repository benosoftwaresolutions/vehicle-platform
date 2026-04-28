import { prisma } from "@/app/lib/prisma"
import { Suspense } from "react"
import RoleButton from "../RoleButton"
import Pagination from "../../components/Pagination"

const PER_PAGE = 20

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page ?? 1))
  const skip = (currentPage - 1) * PER_PAGE

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: "customer" },
      orderBy: { createdAt: "desc" },
      skip,
      take: PER_PAGE,
    }),
    prisma.user.count({ where: { role: "customer" } }),
  ])

  const bookingCounts = await prisma.booking.groupBy({
    by: ["clerkId"],
    where: { clerkId: { in: users.map((u) => u.clerkId) } },
    _count: { id: true },
  })
  const bookingMap = Object.fromEntries(bookingCounts.map((b) => [b.clerkId, b._count.id]))

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
          Customers
        </h1>
        <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>{total} registered</p>
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
            {users.map((user, i) => (
              <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                <td style={{ padding: "12px 16px", color: "#111110", fontWeight: 500 }}>{user.email}</td>
                <td style={{ padding: "12px 16px", color: "#444441" }}>{user.name ?? <span style={{ color: "#d1d0cb" }}>—</span>}</td>
                <td style={{ padding: "12px 16px" }}>
                  <Suspense fallback={null}>
                    <RoleButton userId={user.id} currentRole={user.role} />
                  </Suspense>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {user.profileComplete
                    ? <span style={{ color: "#111110", fontWeight: 600, fontSize: "0.8rem" }}>Complete</span>
                    : <span style={{ color: "#6b6a66", fontSize: "0.8rem" }}>Incomplete</span>
                  }
                </td>
                <td style={{ padding: "12px 16px", color: "#6b6a66" }}>{bookingMap[user.clerkId] ?? 0}</td>
                <td style={{ padding: "12px 16px", color: "#6b6a66", whiteSpace: "nowrap" }}>
                  {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p style={{ padding: "48px", textAlign: "center", color: "#6b6a66" }}>No customers yet.</p>
        )}
      </div>

      <Suspense fallback={null}>
        <Pagination total={total} perPage={PER_PAGE} />
      </Suspense>
    </div>
  )
}
