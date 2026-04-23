import { prisma } from "@/app/lib/prisma"
import DeleteGarageButton from "./DeleteGarageButton"
import Image from "next/image"

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
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
          Garages
        </h1>
        <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>{garages.length} registered</p>
      </div>

      <div style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f4f3ef", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
              {["Logo", "Name", "City", "Rating", "Reviews", "Bookings", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#444441", fontSize: "0.75rem", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {garages.map((garage, i) => (
              <tr key={garage.id} style={{ borderBottom: i < garages.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f4f3ef", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {garage.logoUrl
                      ? <Image src={garage.logoUrl} alt="" fill sizes="36px" style={{ objectFit: "cover" }} />
                      : <span style={{ fontSize: "0.75rem", color: "#6b6a66" }}>—</span>
                    }
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111110" }}>{garage.name}</td>
                <td style={{ padding: "12px 16px", color: "#6b6a66" }}>{garage.city}</td>
                <td style={{ padding: "12px 16px" }}>
                  {garage.rating > 0 ? (
                    <span style={{ color: "#111110", fontWeight: 600 }}>★ {garage.rating.toFixed(1)}</span>
                  ) : (
                    <span style={{ color: "#d1d0cb" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px", color: "#6b6a66" }}>{reviewMap[garage.id] ?? 0}</td>
                <td style={{ padding: "12px 16px", color: "#6b6a66" }}>{bookingMap[garage.id] ?? 0}</td>
                <td style={{ padding: "12px 16px" }}>
                  <DeleteGarageButton garageId={garage.id} garageName={garage.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {garages.length === 0 && (
          <p style={{ padding: "48px", textAlign: "center", color: "#6b6a66" }}>No garages yet.</p>
        )}
      </div>
    </div>
  )
}
