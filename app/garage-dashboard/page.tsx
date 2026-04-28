import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import DryvnFooter from "@/app/components/DryvnFooter"
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
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px" }}>
            Garage Dashboard
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Manage your incoming bookings</p>
        </div>
      </div>
      <main className="page-body" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>
        {!user.garageId ? (
          <GarageSetupPrompt />
        ) : (
          <BookingsList garageId={user.garageId} />
        )}
      </main>
    </>
  )
}

function GarageSetupPrompt() {
  return (
    <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
      <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.4rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "10px" }}>
        Set up your garage
      </h2>
      <p style={{ color: "#6b6a66", marginBottom: "28px", lineHeight: 1.6, fontSize: "0.95rem" }}>
        You haven&apos;t added your garage details yet. Complete the setup to start accepting bookings from customers.
      </p>
      <Link
        href="/onboarding"
        style={{ background: "#111110", color: "#ffffff", padding: "12px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}
      >
        Complete setup
      </Link>
    </div>
  )
}

async function BookingsList({ garageId }: { garageId: string }) {
  const [bookings, garage] = await Promise.all([
    prisma.booking.findMany({
      where: {
        garageId,
        date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
      orderBy: { date: "asc" },
    }),
    prisma.garage.findUnique({
      where: { id: garageId },
      select: { services: true },
    }),
  ])
  const garageServices = garage?.services ?? []

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#111110" }}>
          Bookings
        </h2>
        <div className="dash-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <WalkInBookingButton garageId={garageId} services={garageServices} />
          <Link href="/garage-dashboard/settings" style={{ background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
            Settings
          </Link>
          <Link href="/garage-dashboard/archive" style={{ background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
            Archive
          </Link>
          <Link href="/garage-dashboard/availability" style={{ background: "#111110", color: "#ffffff", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
            Availability
          </Link>
        </div>
      </div>
      {bookings.length === 0 ? (
        <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.25rem", color: "#111110", marginBottom: "8px" }}>No bookings yet</h2>
          <p style={{ color: "#6b6a66" }}>When customers book your garage they will appear here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {bookings.map((booking) => (
            <div key={booking.id} style={{ background: "#f4f3ef", borderRadius: 14, padding: "22px 24px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: "24px" }}>
              <div>
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
                <p style={{ color: "#444441", marginBottom: "2px", fontSize: "0.875rem" }}>{booking.registration}</p>
                <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>
                  {new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at {booking.time}
                </p>
                {booking.garageNote && (
                  <p style={{ color: "#444441", fontSize: "0.85rem", marginTop: "10px", background: "#eceae4", padding: "8px 12px", borderRadius: 8 }}>
                    Note: {booking.garageNote}
                  </p>
                )}
                {booking.suggestedDate && booking.suggestedTime && (
                  <p style={{ color: "#444441", fontSize: "0.85rem", marginTop: "10px", background: "#eceae4", padding: "8px 12px", borderRadius: 8 }}>
                    Suggested: {new Date(booking.suggestedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at {booking.suggestedTime}
                  </p>
                )}
              </div>
              <BookingActions bookingId={booking.id} currentStatus={booking.status} />
            </div>
          ))}
        </div>
      )}
      <DryvnFooter />
    </>
  )
}
