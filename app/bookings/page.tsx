import Navbar from "../components/Navbar"
import AlternativeResponseButtons from "../components/AlternativeResponseButtons"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "../lib/prisma"

const STATUS_STYLES: Record<string, { background: string; color: string; label: string }> = {
  pending:              { background: "#fef3c7", color: "#92400e",  label: "Pending" },
  confirmed:            { background: "#dcfce7", color: "#166534",  label: "Confirmed" },
  declined:             { background: "#fee2e2", color: "#991b1b",  label: "Alternative offered" },
  declined_by_customer: { background: "#f1f5f9", color: "#475569",  label: "Cancelled" },
  completed:            { background: "#e0f2fe", color: "#0369a1",  label: "Completed" },
}

export default async function Bookings() {
  const { userId } = await auth()

  const [bookings, user] = await Promise.all([
    prisma.booking.findMany({
      where: { clerkId: userId! },
      orderBy: { createdAt: "desc" },
    }),
    userId ? prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } }) : null,
  ])

  const garageIds = bookings.map((b) => b.garageId)
  const garages = await prisma.garage.findMany({
    where: { id: { in: garageIds } }
  })

  const garageMap = Object.fromEntries(garages.map((g) => [g.id, g]))

  return (
    <>
      <Navbar role={user?.role} />
      <div style={{background: "#f8f9fb", minHeight: "100vh"}}>
        <div style={{background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "48px 32px"}}>
          <div className="max-w-5xl mx-auto">
            <h1 style={{color: "white", fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem"}}>My Bookings</h1>
            <p style={{color: "#94a3b8", fontSize: "1.1rem"}}>View and manage your garage bookings</p>
          </div>
        </div>
        <main className="max-w-5xl mx-auto px-8 py-12">
          {bookings.length === 0 ? (
            <div style={{background: "white", borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
              <p style={{fontSize: "3rem", marginBottom: "16px"}}>🔧</p>
              <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "8px"}}>No bookings yet</h2>
              <p style={{color: "#64748b", marginBottom: "24px"}}>Find a garage and book your first appointment</p>
              <a href="/garages" style={{background: "#0f172a", color: "white", padding: "12px 24px", borderRadius: "10px", fontWeight: 700, textDecoration: "none"}}>
                Find a Garage
              </a>
            </div>
          ) : (
            <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
              {bookings.map((booking) => {
                const garage = garageMap[booking.garageId]
                const statusStyle = STATUS_STYLES[booking.status] ?? { background: "#f1f5f9", color: "#475569", label: booking.status }
                const hasAlternative = booking.status === "declined" && booking.suggestedDate && booking.suggestedTime

                return (
                  <div key={booking.id} style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
                    <div style={{display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: "16px"}}>
                      <div>
                        <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "4px"}}>{garage?.name || "Unknown Garage"}</h2>
                        <p style={{color: "#64748b", marginBottom: "4px"}}>📍 {garage?.city}, {garage?.postcode}</p>
                        <p style={{color: "#64748b", marginBottom: "4px"}}>🔧 {booking.service}</p>
                        <p style={{color: "#64748b", marginBottom: "4px"}}>🚗 {booking.registration}</p>
                        <p style={{color: "#64748b"}}>📅 {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                      </div>
                      <span style={{
                        background: statusStyle.background,
                        color: statusStyle.color,
                        padding: "6px 14px", borderRadius: "999px",
                        fontSize: "0.875rem", fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    {hasAlternative && (
                      <AlternativeResponseButtons
                        bookingId={booking.id}
                        suggestedDate={booking.suggestedDate!}
                        suggestedTime={booking.suggestedTime!}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </>
  )
}
