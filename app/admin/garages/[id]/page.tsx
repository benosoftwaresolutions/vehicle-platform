import { prisma } from "@/app/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import ApproveButton from "./ApproveButton"

export default async function AdminGarageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [garage, bookings, reviews, owner] = await Promise.all([
    prisma.garage.findUnique({ where: { id } }),
    prisma.booking.findMany({ where: { garageId: id }, orderBy: { date: "desc" } }),
    prisma.review.findMany({ where: { garageId: id }, orderBy: { createdAt: "desc" } }),
    prisma.user.findFirst({ where: { garageId: id }, select: { id: true, email: true, name: true, role: true } }),
  ])

  if (!garage) notFound()

  return (
    <div style={{ padding: "40px" }}>
      <Link href="/admin/garages" style={{ color: "#6b6a66", fontSize: "0.875rem", textDecoration: "none", display: "inline-block", marginBottom: "20px" }}>
        ← Garages
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
            {garage.name}
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>{garage.address}, {garage.city}, {garage.postcode}</p>
        </div>
        <Link
          href={`/garages/${garage.id}`}
          target="_blank"
          style={{ background: "#111110", color: "#ffffff", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", whiteSpace: "nowrap" }}
        >
          View public page
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "32px" }}>
        {/* Owner card */}
        <div style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "24px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Owner</p>
          {owner ? (
            <div>
              <p style={{ fontWeight: 600, color: "#111110", marginBottom: "2px" }}>{owner.name ?? "—"}</p>
              <p style={{ color: "#444441", fontSize: "0.875rem", marginBottom: "10px" }}>{owner.email}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ background: owner.role === "garage_owner" ? "#111110" : "#fef3c7", color: owner.role === "garage_owner" ? "#ffffff" : "#92400e", padding: "3px 10px", borderRadius: 100, fontSize: "0.73rem", fontWeight: 700 }}>
                  {owner.role}
                </span>
                {owner.role === "pending" && <ApproveButton userId={owner.id} />}
              </div>
            </div>
          ) : (
            <p style={{ color: "#6b6a66" }}>No owner found</p>
          )}
        </div>

        {/* Stats card */}
        <div style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "24px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Stats</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", lineHeight: 1 }}>{bookings.length}</p>
              <p style={{ color: "#6b6a66", fontSize: "0.8rem", marginTop: "4px" }}>Bookings</p>
            </div>
            <div>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", lineHeight: 1 }}>{reviews.length}</p>
              <p style={{ color: "#6b6a66", fontSize: "0.8rem", marginTop: "4px" }}>Reviews</p>
            </div>
            <div>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", lineHeight: 1 }}>
                {garage.rating > 0 ? `★ ${garage.rating.toFixed(1)}` : "—"}
              </p>
              <p style={{ color: "#6b6a66", fontSize: "0.8rem", marginTop: "4px" }}>Rating</p>
            </div>
            <div>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", lineHeight: 1 }}>{garage.services.length}</p>
              <p style={{ color: "#6b6a66", fontSize: "0.8rem", marginTop: "4px" }}>Services</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings */}
      <div style={{ marginBottom: "32px" }}>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "14px" }}>
          Bookings ({bookings.length})
        </h2>
        <div className="table-wrap" style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f4f3ef", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
                {["Service", "Date", "Registration", "Status", "Type"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "#444441", fontSize: "0.75rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 500, color: "#111110" }}>{b.service}</td>
                  <td style={{ padding: "10px 16px", color: "#6b6a66", whiteSpace: "nowrap" }}>
                    {new Date(b.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} {b.time}
                  </td>
                  <td style={{ padding: "10px 16px", color: "#444441" }}>{b.registration}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: "#f4f3ef", color: "#444441", padding: "2px 8px", borderRadius: 100, fontSize: "0.73rem", fontWeight: 700 }}>{b.status}</span>
                  </td>
                  <td style={{ padding: "10px 16px", color: "#6b6a66", fontSize: "0.8rem" }}>{b.isWalkIn ? "Walk-in" : "Online"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <p style={{ padding: "32px", textAlign: "center", color: "#6b6a66" }}>No bookings yet.</p>}
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "14px" }}>
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p style={{ color: "#6b6a66" }}>No reviews yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600, color: "#111110", fontSize: "0.875rem" }}>{r.customerName}</span>
                  <span style={{ color: "#111110", fontWeight: 600, fontSize: "0.875rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <p style={{ color: "#444441", fontSize: "0.875rem", lineHeight: 1.5 }}>{r.comment}</p>
                <p style={{ color: "#6b6a66", fontSize: "0.75rem", marginTop: "8px" }}>
                  {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
