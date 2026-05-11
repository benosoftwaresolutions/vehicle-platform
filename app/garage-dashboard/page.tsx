import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { getGarageOwnerContext } from "./layout"
import DryvnFooter from "@/app/components/DryvnFooter"
import BookingActions from "@/app/components/BookingActions"
import BookingHistory from "./BookingHistory"
import WalkInBookingButton from "./WalkInBookingButton"
import Link from "next/link"

export default async function GarageDashboard() {
  const { userId } = await auth()
  const ctx = await getGarageOwnerContext(userId!)
  const garageId = ctx!.garageId!

  const hasServices = ctx!.hasServices!
  const hasAvailability = ctx!.hasAvailability!
  const isApproved = ctx!.approved
  const isLive = ctx!.isLive

  return (
    <>
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px" }}>
            Garage Dashboard
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Manage your incoming bookings</p>
        </div>
      </div>
      <main className="page-body" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>
        {!isLive && (
          <GoLiveChecklist
            hasServices={hasServices}
            hasAvailability={hasAvailability}
            isApproved={isApproved}
          />
        )}
        <BookingsList garageId={garageId} />
        <ReviewsSummary garageId={garageId} />
      </main>
    </>
  )
}

function CheckItem({ done, label, description, action }: {
  done: boolean
  label: string
  description: string
  action?: { href: string; label: string }
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "14px",
      padding: "16px 20px", borderRadius: 10,
      background: done ? "#f4f3ef" : "#ffffff",
      border: `0.5px solid ${done ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.12)"}`,
      opacity: done ? 0.7 : 1,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
        background: done ? "#111110" : "transparent",
        border: done ? "none" : "1.5px solid #d1d0cb",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {done && <span style={{ color: "#ffffff", fontSize: "0.6rem", fontWeight: 700 }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111110", margin: "0 0 2px" }}>{label}</p>
        <p style={{ fontSize: "0.82rem", color: "#6b6a66", margin: 0 }}>{description}</p>
      </div>
      {!done && action && (
        <Link
          href={action.href}
          style={{
            background: "#111110", color: "#ffffff",
            padding: "7px 16px", borderRadius: 100,
            fontWeight: 600, fontSize: "0.8rem", textDecoration: "none",
            whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

function GoLiveChecklist({ hasServices, hasAvailability, isApproved }: {
  hasServices: boolean
  hasAvailability: boolean
  isApproved: boolean
}) {
  // Only count the two steps the owner can action themselves
  const actionableCount = [hasServices, hasAvailability].filter(Boolean).length
  const actionsComplete = hasServices && hasAvailability
  const awaitingApproval = actionsComplete && !isApproved

  return (
    <div style={{ background: "#f9f8f5", border: "0.5px solid rgba(0,0,0,0.10)", borderRadius: 14, padding: "24px", marginBottom: "32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em", color: "#111110", margin: 0 }}>
          Get your garage live
        </h2>
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: awaitingApproval ? "#92400e" : "#6b6a66" }}>
          {awaitingApproval ? "Awaiting admin approval" : `${actionableCount} of 2 complete`}
        </span>
      </div>
      <p style={{ fontSize: "0.85rem", color: "#6b6a66", margin: "0 0 16px" }}>
        {awaitingApproval
          ? "You’ve done everything — we’ll review your listing and approve it within 1–2 business days."
          : "Your garage won’t appear in search results until all steps are done."}
      </p>

      {/* Progress bar */}
      <div style={{ height: 4, background: "#eceae4", borderRadius: 100, marginBottom: "20px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(actionableCount / 2) * 100}%`, background: "#111110", borderRadius: 100, transition: "width 0.3s" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <CheckItem
          done={true}
          label="Garage profile created"
          description="Your basic details, name, and address are saved"
        />
        <CheckItem
          done={hasServices}
          label="Add your services"
          description="Let customers know what work you offer and at what price"
          action={{ href: "/garage-dashboard/settings", label: "Add services" }}
        />
        <CheckItem
          done={hasAvailability}
          label="Set your availability"
          description="Confirm your opening hours so customers can book slots"
          action={{ href: "/garage-dashboard/availability", label: "Set availability" }}
        />
        <CheckItem
          done={isApproved}
          label="Admin approval"
          description={awaitingApproval ? "Under review — usually 1–2 business days" : "We review each garage before it goes live"}
        />
      </div>
    </div>
  )
}

async function ReviewsSummary({ garageId }: { garageId: string }) {
  const reviews = await prisma.review.findMany({
    where: { garageId },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  if (reviews.length === 0) return null

  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div style={{ marginTop: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#111110" }}>
          Customer Reviews
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#111110", fontWeight: 700, fontSize: "1rem" }}>★ {avg.toFixed(1)}</span>
          <span style={{ color: "#6b6a66", fontSize: "0.85rem" }}>({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {reviews.map(r => (
          <div key={r.id} style={{ background: "#f4f3ef", borderRadius: 12, padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111110" }}>{r.customerName}</span>
                <span style={{ marginLeft: 8, color: "#6b6a66", fontSize: "0.78rem" }}>
                  {new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <span style={{ fontSize: "0.875rem", color: "#111110" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
            </div>
            {r.comment && <p style={{ fontSize: "0.875rem", color: "#444441", margin: 0, lineHeight: 1.5 }}>{r.comment}</p>}
          </div>
        ))}
      </div>
      <DryvnFooter />
    </div>
  )
}

async function BookingsList({ garageId }: { garageId: string }) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const [bookings, garage, monthlyRevenue, monthlyCompleted] = await Promise.all([
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
    prisma.booking.aggregate({
      where: { garageId, status: "completed", date: { gte: monthStart, lte: monthEnd }, jobValue: { not: null } },
      _sum: { jobValue: true },
    }),
    prisma.booking.count({
      where: { garageId, status: "completed", date: { gte: monthStart, lte: monthEnd } },
    }),
  ])
  const garageServices = garage?.services ?? []
  const revenue = monthlyRevenue._sum.jobValue ?? 0
  const monthName = now.toLocaleString("en-GB", { month: "long" })

  return (
    <>
      {/* Revenue summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "28px" }}>
        <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "20px 22px" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b6a66", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{monthName} revenue</p>
          <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.8rem", color: "#111110", letterSpacing: "-0.03em" }}>
            {revenue > 0 ? `£${revenue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
          </p>
          <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginTop: "4px" }}>from jobs with value logged</p>
        </div>
        <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "20px 22px" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b6a66", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{monthName} completed</p>
          <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.8rem", color: "#111110", letterSpacing: "-0.03em" }}>{monthlyCompleted}</p>
          <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginTop: "4px" }}>jobs this month</p>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#111110" }}>
          Bookings
        </h2>
        <div className="dash-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <WalkInBookingButton garageId={garageId} services={garageServices} />
          <Link href="/garage-dashboard/settings" style={{ background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
            Settings
          </Link>
          <Link href="/garage-dashboard/calendar" style={{ background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
            Calendar
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
                <BookingHistory garageId={garageId} registration={booking.registration} />
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
    </>
  )
}
