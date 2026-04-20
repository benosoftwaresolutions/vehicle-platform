import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import BookingActions from "@/app/components/BookingActions"
import WalkInBookingButton from "./WalkInBookingButton"
import Link from "next/link"

export default async function GarageDashboard() {
  const { userId } = await auth()

  if (!userId) redirect("/")

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user || user.role !== "garage_owner") redirect("/")

  return (
    <>
      <Navbar role={user.role} />
      <div style={{background: "#f8f9fb", minHeight: "100vh"}}>
        <div style={{background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "48px 32px"}}>
          <div className="max-w-5xl mx-auto">
            <h1 style={{color: "white", fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem"}}>Garage Dashboard</h1>
            <p style={{color: "#94a3b8", fontSize: "1.1rem"}}>Manage your incoming bookings</p>
          </div>
        </div>
        <main className="max-w-5xl mx-auto px-8 py-12">
          {!user.garageId ? (
            <GarageSetupPrompt />
          ) : (
            <BookingsList garageId={user.garageId} />
          )}
        </main>
      </div>
    </>
  )
}

function GarageSetupPrompt() {
  return (
    <div style={{background: "white", borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", maxWidth: "480px", margin: "0 auto"}}>
      <p style={{fontSize: "3rem", marginBottom: "16px"}}>🔧</p>
      <h2 style={{fontWeight: 700, fontSize: "1.5rem", marginBottom: "8px"}}>Set up your garage</h2>
      <p style={{color: "#64748b", marginBottom: "28px", lineHeight: 1.6}}>
        You haven&apos;t added your garage details yet. Complete the setup to start accepting bookings from customers.
      </p>
      <div style={{display: "flex", gap: "12px", justifyContent: "center"}}>
        <Link
          href="/onboarding"
          style={{background: "#f59e0b", color: "#0f172a", padding: "12px 28px", borderRadius: "10px", fontWeight: 700, fontSize: "0.95rem", textDecoration: "none"}}
        >
          Complete setup
        </Link>
      </div>
    </div>
  )
}

async function BookingsList({ garageId }: { garageId: string }) {
  const [bookings, garage] = await Promise.all([
    prisma.booking.findMany({
      where: { garageId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.garage.findUnique({
      where: { id: garageId },
      select: { services: true },
    }),
  ])
  const garageServices = garage?.services ?? []

  return (
    <>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px"}}>
        <h2 style={{fontWeight: 700, fontSize: "1.25rem"}}>Bookings</h2>
        <div style={{display: "flex", gap: "12px"}}>
          <WalkInBookingButton garageId={garageId} services={garageServices} />
          <Link href="/garage-dashboard/settings" style={{background: "white", color: "#0f172a", border: "1px solid #e5e7eb", padding: "10px 20px", borderRadius: "10px", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none"}}>
            Garage Settings
          </Link>
          <Link href="/garage-dashboard/availability" style={{background: "#0f172a", color: "white", padding: "10px 20px", borderRadius: "10px", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none"}}>
            ⚙️ Availability
          </Link>
        </div>
      </div>
      {bookings.length === 0 ? (
        <div style={{background: "white", borderRadius: "16px", padding: "48px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
          <p style={{fontSize: "3rem", marginBottom: "16px"}}>📋</p>
          <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "8px"}}>No bookings yet</h2>
          <p style={{color: "#64748b"}}>When customers book your garage they will appear here</p>
        </div>
      ) : (
        <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          {bookings.map((booking) => (
            <div key={booking.id} style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: "24px"}}>
              <div>
                <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px"}}>
                  <h2 style={{fontWeight: 700, fontSize: "1.25rem"}}>{booking.service}</h2>
                  {booking.isWalkIn && (
                    <span style={{background: "#fef3c7", color: "#92400e", padding: "2px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700}}>
                      Walk-in
                    </span>
                  )}
                </div>
                {booking.isWalkIn && booking.customerName && (
                  <p style={{color: "#0f172a", fontWeight: 600, marginBottom: "2px"}}>👤 {booking.customerName}</p>
                )}
                {booking.isWalkIn && booking.customerPhone && (
                  <p style={{color: "#64748b", marginBottom: "4px"}}>📞 {booking.customerPhone}</p>
                )}
                <p style={{color: "#64748b", marginBottom: "4px"}}>🚗 {booking.registration}</p>
                <p style={{color: "#64748b", marginBottom: "4px"}}>📅 {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                {booking.garageNote && (
                  <p style={{color: "#92400e", fontSize: "0.875rem", marginTop: "8px", background: "#fef3c7", padding: "8px 12px", borderRadius: "8px"}}>
                    Note: {booking.garageNote}
                  </p>
                )}
                {booking.suggestedDate && booking.suggestedTime && (
                  <p style={{color: "#1e40af", fontSize: "0.875rem", marginTop: "8px", background: "#dbeafe", padding: "8px 12px", borderRadius: "8px"}}>
                    Suggested: {new Date(booking.suggestedDate).toLocaleDateString()} at {booking.suggestedTime}
                  </p>
                )}
              </div>
              <BookingActions bookingId={booking.id} currentStatus={booking.status} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}