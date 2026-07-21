import { prisma } from "@/app/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import ApproveButton from "./ApproveButton"
import AdminNotesForm from "./AdminNotesForm"

export default async function AdminGarageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [garage, bookings, reviews, owner] = await Promise.all([
    prisma.garage.findUnique({ where: { id } }),
    prisma.booking.findMany({ where: { garageId: id }, orderBy: { date: "desc" } }),
    prisma.review.findMany({ where: { garageId: id }, orderBy: { createdAt: "desc" } }),
    prisma.user.findFirst({ where: { garageId: id }, select: { id: true, email: true, name: true, role: true } }),
  ])

  if (!garage) notFound()

  const completedBookings = bookings.filter(b => b.status === "completed")
  const completionRate = bookings.length > 0 ? Math.round((completedBookings.length / bookings.length) * 100) : 0
  const jobValues = completedBookings.filter(b => b.jobValue).map(b => b.jobValue!)
  const avgJobValue = jobValues.length > 0 ? jobValues.reduce((a, b) => a + b, 0) / jobValues.length : null
  const totalRevenue = jobValues.reduce((a, b) => a + b, 0)
  const topServices = Object.entries(
    bookings.reduce<Record<string, number>>((acc, b) => { acc[b.service] = (acc[b.service] ?? 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 3)

  return (
    <div style={{ padding: "40px" }}>
      <Link href="/admin/garages" style={{ color: "#6b6a66", fontSize: "0.875rem", textDecoration: "none", display: "inline-block", marginBottom: "20px" }}>
        ← Garages
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
            {garage.name}
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>{garage.address}, {garage.city}, {garage.postcode}</p>
          {/* Tappable on a phone — this is the screen used standing on a forecourt */}
          <p style={{ color: "#6b6a66", fontSize: "0.9rem", marginTop: "4px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
            {garage.email
              ? <a href={`mailto:${garage.email}`} style={{ color: "#111110" }}>{garage.email}</a>
              : <span style={{ color: "#b91c1c" }}>No email on file</span>}
            {garage.phone
              ? <a href={`tel:${garage.phone.replace(/\s+/g, "")}`} style={{ color: "#111110" }}>{garage.phone}</a>
              : <span style={{ color: "#b91c1c" }}>No phone on file</span>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Link
            href={`/admin/garages/${garage.id}/report`}
            target="_blank"
            style={{ background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            Share report
          </Link>
          <Link
            href={`/garages/${garage.id}`}
            target="_blank"
            style={{ background: "#111110", color: "#ffffff", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            View public page
          </Link>
        </div>
      </div>

      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "20px" }}>
        {[
          { label: "Total Bookings", value: bookings.length },
          { label: "Completed", value: `${completedBookings.length} (${completionRate}%)` },
          { label: "Revenue Logged", value: totalRevenue > 0 ? `£${totalRevenue.toFixed(2)}` : "—" },
          { label: "Avg Job Value", value: avgJobValue ? `£${avgJobValue.toFixed(2)}` : "—" },
        ].map(s => (
          <div key={s.label} style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "18px 20px" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>{s.label}</p>
            <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.4rem", color: "#111110", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
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
                {!garage.approved && <ApproveButton garageId={garage.id} />}
              </div>
            </div>
          ) : (
            <p style={{ color: "#6b6a66" }}>No owner found</p>
          )}
        </div>

        {/* Performance card */}
        <div style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "24px" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Performance</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", lineHeight: 1 }}>
                {garage.rating > 0 ? `★ ${garage.rating.toFixed(1)}` : "—"}
              </p>
              <p style={{ color: "#6b6a66", fontSize: "0.8rem", marginTop: "4px" }}>Rating ({reviews.length} reviews)</p>
            </div>
            <div>
              <p style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", lineHeight: 1 }}>{garage.services.length}</p>
              <p style={{ color: "#6b6a66", fontSize: "0.8rem", marginTop: "4px" }}>Services listed</p>
            </div>
          </div>
          {topServices.length > 0 && (
            <div style={{ marginTop: "14px" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Top services</p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {topServices.map(([name, count]) => (
                  <span key={name} style={{ background: "#f4f3ef", color: "#444441", padding: "3px 10px", borderRadius: 100, fontSize: "0.78rem", fontWeight: 600 }}>
                    {name} ({count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin notes */}
      <div style={{ marginBottom: "28px" }}>
        <AdminNotesForm garageId={garage.id} initialNotes={garage.adminNotes ?? null} />
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
                {["Service", "Vehicle", "Date", "Status", "Value", "Type"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: "#444441", fontSize: "0.75rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 500, color: "#111110" }}>{b.service}</td>
                  <td style={{ padding: "10px 16px", color: "#444441" }}>
                    {b.registration}{b.vehicleMake ? ` · ${b.vehicleMake} ${b.vehicleModel ?? ""}`.trimEnd() : ""}
                  </td>
                  <td style={{ padding: "10px 16px", color: "#6b6a66", whiteSpace: "nowrap" }}>
                    {new Date(b.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} {b.time}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{ background: "#f4f3ef", color: "#444441", padding: "2px 8px", borderRadius: 100, fontSize: "0.73rem", fontWeight: 700 }}>{b.status}</span>
                  </td>
                  <td style={{ padding: "10px 16px", color: "#111110", fontWeight: 600 }}>{b.jobValue ? `£${b.jobValue.toFixed(2)}` : "—"}</td>
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
