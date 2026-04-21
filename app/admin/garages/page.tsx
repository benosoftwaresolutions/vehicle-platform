import { prisma } from "@/app/lib/prisma"
import DeleteGarageButton from "./DeleteGarageButton"

export default async function AdminGarages() {
  const garages = await prisma.garage.findMany({ orderBy: { createdAt: "desc" } })

  const garageIds = garages.map((g) => g.id)

  const [bookingCounts, reviewCounts] = await Promise.all([
    prisma.booking.groupBy({ by: ["garageId"], where: { garageId: { in: garageIds } }, _count: { id: true } }),
    prisma.review.groupBy({ by: ["garageId"], where: { garageId: { in: garageIds } }, _count: { id: true } }),
  ])

  const bookingMap = Object.fromEntries(bookingCounts.map((b) => [b.garageId, b._count.id]))
  const reviewMap  = Object.fromEntries(reviewCounts.map((r)  => [r.garageId,  r._count.id]))

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Garages</h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>{garages.length} registered</p>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #e5e7eb" }}>
              {["Logo", "Name", "City", "Rating", "Reviews", "Bookings", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {garages.map((garage, i) => (
              <tr key={garage.id} style={{ borderBottom: i < garages.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "8px", background: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {garage.logoUrl
                      ? <img src={garage.logoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontSize: "1rem" }}>🔧</span>
                    }
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{garage.name}</td>
                <td style={{ padding: "12px 16px", color: "#64748b" }}>{garage.city}</td>
                <td style={{ padding: "12px 16px", color: "#64748b" }}>
                  {garage.rating > 0 ? (
                    <span style={{ color: "#f59e0b", fontWeight: 600 }}>★ {garage.rating.toFixed(1)}</span>
                  ) : (
                    <span style={{ color: "#d1d5db" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px", color: "#64748b" }}>{reviewMap[garage.id] ?? 0}</td>
                <td style={{ padding: "12px 16px", color: "#64748b" }}>{bookingMap[garage.id] ?? 0}</td>
                <td style={{ padding: "12px 16px" }}>
                  <DeleteGarageButton garageId={garage.id} garageName={garage.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {garages.length === 0 && (
          <p style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>No garages yet.</p>
        )}
      </div>
    </div>
  )
}
