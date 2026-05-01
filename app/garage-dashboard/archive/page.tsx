import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import Navbar from "@/app/components/Navbar"
import Link from "next/link"

function NotAuthorized() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", marginBottom: 12 }}>Not authorised</h1>
        <Link href="/" style={{ color: "#6b6a66", textDecoration: "none" }}>Go home</Link>
      </div>
    </div>
  )
}

export default async function ArchivePage() {
  const { userId } = await auth()

  if (!userId) return <NotAuthorized />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user || user.role !== "garage_owner") return <NotAuthorized />
  if (!user.garageId) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", marginBottom: 12 }}>No garage found</h1>
        <Link href="/garage-dashboard" style={{ color: "#6b6a66", textDecoration: "none" }}>Back to dashboard</Link>
      </div>
    </div>
  )

  const bookings = await prisma.booking.findMany({
    where: {
      garageId: user.garageId,
      date: { lt: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    orderBy: { date: "desc" },
  })

  return (
    <>
      <Navbar role={user.role} />
      <div style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Link href="/garage-dashboard" style={{ color: "#6b6a66", fontSize: "0.875rem", textDecoration: "none", display: "inline-block", marginBottom: "12px" }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px" }}>
            Archive
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Past bookings</p>
        </div>
      </div>
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>
        {bookings.length === 0 ? (
          <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.25rem", color: "#111110", marginBottom: "8px" }}>No past bookings</h2>
            <p style={{ color: "#6b6a66" }}>Completed bookings will appear here</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {bookings.map((booking) => (
              <div key={booking.id} style={{ background: "#f4f3ef", borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em", color: "#111110" }}>
                    {booking.service}
                  </h2>
                  {booking.isWalkIn && (
                    <span style={{ background: "#eceae4", color: "#111110", padding: "2px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700 }}>
                      Walk-in
                    </span>
                  )}
                  <span style={{ marginLeft: "auto", background: "#eceae4", color: "#6b6a66", padding: "2px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600 }}>
                    {booking.status}
                  </span>
                </div>
                {booking.isWalkIn && booking.customerName && (
                  <p style={{ color: "#111110", fontWeight: 600, marginBottom: "2px", fontSize: "0.875rem" }}>{booking.customerName}</p>
                )}
                {booking.isWalkIn && booking.customerPhone && (
                  <p style={{ color: "#6b6a66", marginBottom: "2px", fontSize: "0.875rem" }}>{booking.customerPhone}</p>
                )}
                <p style={{ color: "#444441", marginBottom: "2px", fontSize: "0.875rem" }}>{booking.registration}</p>
                <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>
                  {new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at {booking.time}
                </p>
                {booking.garageNote && (
                  <p style={{ color: "#444441", fontSize: "0.85rem", marginTop: "10px", background: "#eceae4", padding: "8px 12px", borderRadius: 8 }}>
                    Note: {booking.garageNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
