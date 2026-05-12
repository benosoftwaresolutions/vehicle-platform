import { prisma } from "@/app/lib/prisma"
import { notFound } from "next/navigation"
import PrintButton from "./PrintButton"

export default async function GarageReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [garage, bookings, reviews] = await Promise.all([
    prisma.garage.findUnique({ where: { id } }),
    prisma.booking.findMany({ where: { garageId: id, status: "completed" }, orderBy: { date: "desc" } }),
    prisma.review.findMany({ where: { garageId: id }, orderBy: { createdAt: "desc" } }),
  ])

  if (!garage) notFound()

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.jobValue ?? 0), 0)
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null
  const generatedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", maxWidth: 680, margin: "0 auto", padding: "48px 32px", color: "#111110" }}>

      {/* Print button — hidden on print */}
      <div className="no-print" style={{ marginBottom: "32px", display: "flex", justifyContent: "flex-end" }}>
        <PrintButton />
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px", paddingBottom: "24px", borderBottom: "0.5px solid rgba(0,0,0,0.12)" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6a66", marginBottom: "8px" }}>Fyca · Fix Your Car Anywhere</div>
          <h1 style={{ fontFamily: "Georgia,serif", fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.02em", margin: "0 0 6px" }}>{garage.name}</h1>
          <p style={{ color: "#6b6a66", fontSize: "0.9rem", margin: 0 }}>{garage.address}, {garage.city}, {garage.postcode}</p>
          {garage.phone && <p style={{ color: "#6b6a66", fontSize: "0.875rem", margin: "2px 0 0" }}>{garage.phone}</p>}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "0.78rem", color: "#6b6a66" }}>Report generated</p>
          <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{generatedDate}</p>
          {garage.approved
            ? <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, display: "inline-block", marginTop: "8px" }}>Live on Fyca</span>
            : <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, display: "inline-block", marginTop: "8px" }}>Pending approval</span>
          }
        </div>
      </div>

      {/* Key stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Jobs Completed", value: bookings.length.toString() },
          { label: "Revenue Logged", value: totalRevenue > 0 ? `£${totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—" },
          { label: "Avg Rating", value: avgRating ? `★ ${avgRating.toFixed(1)}` : "—" },
        ].map(s => (
          <div key={s.label} style={{ background: "#f9f8f5", borderRadius: 12, padding: "18px 20px" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>{s.label}</p>
            <p style={{ fontFamily: "Georgia,serif", fontWeight: 600, fontSize: "1.6rem", color: "#111110", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Services */}
      {garage.services.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontWeight: 600, fontSize: "1.1rem", marginBottom: "12px", letterSpacing: "-0.01em" }}>Services Offered</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {garage.services.map(s => (
              <span key={s} style={{ background: "#f4f3ef", color: "#444441", padding: "4px 12px", borderRadius: 100, fontSize: "0.82rem", fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontWeight: 600, fontSize: "1.1rem", marginBottom: "12px", letterSpacing: "-0.01em" }}>
            Customer Reviews ({reviews.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {reviews.slice(0, 5).map(r => (
              <div key={r.id} style={{ borderLeft: "2px solid #eceae4", paddingLeft: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.customerName}</span>
                  <span style={{ fontSize: "0.875rem" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                </div>
                <p style={{ color: "#444441", fontSize: "0.875rem", margin: "0 0 4px", lineHeight: 1.5 }}>{r.comment}</p>
                <p style={{ color: "#6b6a66", fontSize: "0.75rem", margin: 0 }}>
                  {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.12)", paddingTop: "20px", fontSize: "0.78rem", color: "#6b6a66" }}>
        <p style={{ margin: 0 }}>This report was generated by Fyca — fyca.co.uk</p>
      </div>

      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  )
}
