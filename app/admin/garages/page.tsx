import { prisma } from "@/app/lib/prisma"
import DeleteGarageButton from "./DeleteGarageButton"
import ApproveGarageButton from "./ApproveGarageButton"
import Image from "next/image"
import Link from "next/link"

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

      <div style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f4f3ef", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
              {["Logo", "Name", "City", "Owner", "Status", "Rating", "Reviews", "Bookings", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#444441", fontSize: "0.75rem", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {garages.map((garage, i) => {
              const owner = ownerMap[garage.id]
              const isPending = owner?.role === "pending"
              return (
                <tr key={garage.id} style={{ borderBottom: i < garages.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none", background: isPending ? "#fffbeb" : undefined }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f4f3ef", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {garage.logoUrl
                        ? <Image src={garage.logoUrl} alt="" fill sizes="36px" style={{ objectFit: "cover" }} />
                        : <span style={{ fontSize: "0.75rem", color: "#6b6a66" }}>—</span>
                      }
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/garages/${garage.id}`} style={{ fontWeight: 600, color: "#111110", textDecoration: "none" }}>
                      {garage.name}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b6a66" }}>{garage.city}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div>
                      {garage.email
                        ? <div style={{ color: "#444441", fontSize: "0.8rem" }}>{garage.email}</div>
                        : <span style={{ color: "#dc2626", fontSize: "0.78rem", fontWeight: 600 }}>No email</span>
                      }
                      {garage.phone && <div style={{ color: "#6b6a66", fontSize: "0.78rem" }}>{garage.phone}</div>}
                      {isPending && (
                        <span style={{ background: "#fef3c7", color: "#92400e", padding: "1px 8px", borderRadius: 100, fontSize: "0.7rem", fontWeight: 700, display: "inline-block", marginTop: "2px" }}>
                          Owner pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {garage.approved
                      ? <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700 }}>Live</span>
                      : <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700 }}>Pending</span>
                    }
                  </td>
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
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <Link
                        href={`/garages/${garage.id}`}
                        target="_blank"
                        style={{ background: "transparent", color: "#444441", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                      >
                        View
                      </Link>
                      {!garage.approved && <ApproveGarageButton garageId={garage.id} />}
                      <DeleteGarageButton garageId={garage.id} garageName={garage.name} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {garages.length === 0 && (
          <p style={{ padding: "48px", textAlign: "center", color: "#6b6a66" }}>No garages yet.</p>
        )}
      </div>
    </div>
  )
}
