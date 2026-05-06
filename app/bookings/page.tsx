import Link from "next/link"
import Navbar from "../components/Navbar"
import OnboardingBanner from "../components/OnboardingBanner"
import AlternativeResponseButtons from "../components/AlternativeResponseButtons"
import CancelBookingButton from "./CancelBookingButton"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "../lib/prisma"
import { getCachedUser } from "../lib/cache"

const STATUS_STYLES: Record<string, { background: string; color: string; label: string; textDecoration?: string }> = {
  pending:              { background: "#f4f3ef", color: "#444441",  label: "Pending" },
  confirmed:            { background: "#111110", color: "#ffffff",  label: "Confirmed" },
  declined:             { background: "#eceae4", color: "#111110",  label: "Alternative offered", textDecoration: "line-through" },
  declined_by_customer: { background: "#f4f3ef", color: "#6b6a66",  label: "Cancelled" },
  completed:            { background: "#eceae4", color: "#111110",  label: "Completed" },
}

export default async function Bookings() {
  const { userId } = await auth()

  const [bookings, user, allGarages] = await Promise.all([
    prisma.booking.findMany({
      where: { clerkId: userId! },
      orderBy: { createdAt: "desc" },
    }),
    userId ? getCachedUser(userId) : null,
    prisma.garage.findMany({ select: { id: true, name: true, city: true, postcode: true } }),
  ])

  const garageMap = Object.fromEntries(allGarages.map((g) => [g.id, g]))
  const showBanner = !!userId && (!user || !user.profileComplete)

  return (
    <>
      <Navbar role={user?.role} />
      {showBanner && <OnboardingBanner />}
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px" }}>
            My Bookings
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>View and manage your garage bookings</p>
        </div>
      </div>
      <main className="page-body" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>
        {bookings.length === 0 ? (
          <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.25rem", color: "#111110", marginBottom: "8px" }}>No bookings yet</h2>
            <p style={{ color: "#6b6a66", marginBottom: "24px" }}>Find a garage and book your first appointment</p>
            <Link href="/garages" style={{ background: "#111110", color: "#ffffff", padding: "12px 24px", borderRadius: 100, fontWeight: 600, textDecoration: "none", fontSize: "0.9rem" }}>
              Find a Garage
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {bookings.map((booking) => {
              const garage = garageMap[booking.garageId]
              const statusStyle = STATUS_STYLES[booking.status] ?? { background: "#f4f3ef", color: "#444441", label: booking.status }
              const hasAlternative = booking.status === "declined" && booking.suggestedDate && booking.suggestedTime

              return (
                <div key={booking.id} style={{ background: "#f4f3ef", borderRadius: 14, padding: "22px 24px" }}>
                  <div className="booking-card" style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", gap: "16px" }}>
                    <div>
                      <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "6px" }}>
                        {garage?.name || "Unknown Garage"}
                      </h2>
                      <p style={{ color: "#6b6a66", fontSize: "0.875rem", marginBottom: "2px" }}>{garage?.city}, {garage?.postcode}</p>
                      <p style={{ color: "#444441", fontSize: "0.875rem", marginBottom: "2px" }}>{booking.service}</p>
                      <p style={{ color: "#444441", fontSize: "0.875rem", marginBottom: "2px" }}>{booking.registration}</p>
                      <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>
                        {new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} at {booking.time}
                      </p>
                    </div>
                    <span style={{
                      background: statusStyle.background,
                      color: statusStyle.color,
                      padding: "5px 14px",
                      borderRadius: 100,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      textDecoration: statusStyle.textDecoration,
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
                  {["pending", "confirmed"].includes(booking.status) && (
                    <CancelBookingButton bookingId={booking.id} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
