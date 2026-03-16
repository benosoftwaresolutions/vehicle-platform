import { auth } from "@clerk/nextjs/server"
import { prisma } from "../lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "../components/Navbar"

export default async function GarageDashboard() {
  const { userId } = await auth()
  console.log("clerk userId:" , userId)

  if (!userId) {
    redirect("/")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  console.log("user found:", user)

  if (!user || user.role !== "garage_owner") {
    redirect("/")
  }

  const bookings = await prisma.booking.findMany({
    where: { garageId: user.garageId! },
    orderBy: { createdAt: "desc" }
  })

  return (
    <>
      <Navbar />
      <div style={{background: "#f8f9fb", minHeight: "100vh"}}>
        <div style={{background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "48px 32px"}}>
          <div className="max-w-5xl mx-auto">
            <h1 style={{color: "white", fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem"}}>Garage Dashboard</h1>
            <p style={{color: "#94a3b8", fontSize: "1.1rem"}}>Manage your incoming bookings</p>
          </div>
        </div>
        <main className="max-w-5xl mx-auto px-8 py-12">
          {bookings.length === 0 ? (
            <div style={{background: "white", borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
              <p style={{fontSize: "3rem", marginBottom: "16px"}}>📋</p>
              <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "8px"}}>No bookings yet</h2>
              <p style={{color: "#64748b"}}>When customers book your garage they will appear here</p>
            </div>
          ) : (
            <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
              {bookings.map((booking) => (
                <div key={booking.id} style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "16px"}}>
                  <div>
                    <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "4px"}}>{booking.service}</h2>
                    <p style={{color: "#64748b", marginBottom: "4px"}}>🚗 {booking.registration}</p>
                    <p style={{color: "#64748b", marginBottom: "4px"}}>📅 {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                    <p style={{color: "#64748b", fontSize: "0.875rem"}}>Booking ID: {booking.id}</p>
                  </div>
                  <div style={{display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end"}}>
                    <span style={{background: "#fef3c7", color: "#92400e", padding: "6px 14px", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600}}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  )
}