import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { getGarageOwnerContext } from "../layout"
import Link from "next/link"

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  completed:            { label: "Completed",   color: "#111110" },
  declined:             { label: "Declined",    color: "#6b6a66" },
  declined_by_customer: { label: "Cancelled",   color: "#6b6a66" },
  pending:              { label: "Expired",     color: "#6b6a66" },
  confirmed:            { label: "Confirmed",   color: "#111110" },
}

export default async function ArchivePage() {
  const { userId } = await auth()
  const ctx = await getGarageOwnerContext(userId!)

  const bookings = await prisma.booking.findMany({
    where: {
      garageId: ctx!.garageId!,
      OR: [
        { date: { lt: new Date(new Date().setHours(0, 0, 0, 0)) } },
        { status: "completed" },
      ],
    },
    orderBy: { date: "desc" },
  })

  const totalRevenue = bookings
    .filter(b => b.status === "completed" && b.jobValue)
    .reduce((sum, b) => sum + (b.jobValue ?? 0), 0)

  const completedCount = bookings.filter(b => b.status === "completed").length

  return (
    <>
      <div style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b6a66", marginBottom: "14px" }}>
            <Link href="/garage-dashboard" style={{ color: "#6b6a66", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ margin: "0 6px" }}>→</span>
            Archive
          </p>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px" }}>
            Archive
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Past and completed bookings</p>
        </div>
      </div>
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>

        {completedCount > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "32px" }}>
            <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "20px 22px" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b6a66", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total revenue logged</p>
              <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.8rem", color: "#111110", letterSpacing: "-0.03em" }}>
                {totalRevenue > 0 ? `£${totalRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
              </p>
            </div>
            <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "20px 22px" }}>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b6a66", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Jobs completed</p>
              <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.8rem", color: "#111110", letterSpacing: "-0.03em" }}>{completedCount}</p>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.25rem", color: "#111110", marginBottom: "8px" }}>No past bookings</h2>
            <p style={{ color: "#6b6a66" }}>Completed bookings will appear here</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {bookings.map((booking) => {
              const st = STATUS_LABELS[booking.status] ?? { label: booking.status, color: "#6b6a66" }
              return (
                <div key={booking.id} style={{ background: "#f4f3ef", borderRadius: 14, padding: "22px 24px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em", color: "#111110" }}>
                          {booking.service}
                        </h2>
                        {booking.isWalkIn && (
                          <span style={{ background: "#eceae4", color: "#111110", padding: "2px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>
                            Walk-in
                          </span>
                        )}
                      </div>
                      {booking.isWalkIn && booking.customerName && (
                        <p style={{ color: "#111110", fontWeight: 600, marginBottom: "2px", fontSize: "0.875rem" }}>{booking.customerName}</p>
                      )}
                      {booking.isWalkIn && booking.customerPhone && (
                        <p style={{ color: "#6b6a66", marginBottom: "2px", fontSize: "0.875rem" }}>{booking.customerPhone}</p>
                      )}
                      <p style={{ color: "#444441", marginBottom: "2px", fontSize: "0.875rem" }}>
                        {booking.registration}{booking.vehicleMake ? ` — ${booking.vehicleMake} ${booking.vehicleModel ?? ""}`.trimEnd() : ""}
                      </p>
                      <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>
                        {new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at {booking.time}
                      </p>
                      {booking.garageNote && (
                        <p style={{ color: "#444441", fontSize: "0.85rem", marginTop: "8px", background: "#eceae4", padding: "8px 12px", borderRadius: 8 }}>
                          Note: {booking.garageNote}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                      <span style={{ background: "#eceae4", color: st.color, padding: "4px 12px", borderRadius: 100, fontSize: "0.78rem", fontWeight: 600 }}>
                        {st.label}
                      </span>
                      {booking.jobValue && (
                        <span style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1rem", color: "#111110" }}>
                          £{booking.jobValue.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
