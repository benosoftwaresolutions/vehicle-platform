import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { cache } from "react"
import Navbar from "@/app/components/Navbar"
import Link from "next/link"
import { isGarageAccessAllowed, garageTrialDaysLeft, garageGraceDaysLeft } from "@/app/lib/subscription"

// Deduplicates across layout + page in the same request
export const getGarageOwnerContext = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, garageId: true },
  })
  if (!user || user.role !== "garage_owner") return null
  if (!user.garageId) return { garageId: null, approved: false, isLive: false }

  const [garage, availability] = await Promise.all([
    prisma.garage.findUnique({
      where: { id: user.garageId },
      select: { approved: true, services: true, subscriptionStatus: true, trialEndsAt: true, subscriptionEnd: true, pastDueAt: true, stripeSubscriptionId: true },
    }),
    prisma.garageAvailability.findUnique({
      where: { garageId: user.garageId },
      select: { id: true },
    }),
  ])

  const approved = garage?.approved ?? false
  const hasServices = (garage?.services ?? []).length > 0
  const hasAvailability = !!availability
  const isLive = approved && hasServices && hasAvailability

  const subscriptionStatus = garage?.subscriptionStatus ?? "trialing"
  const trialEndsAt = garage?.trialEndsAt ?? null
  const subscriptionEnd = garage?.subscriptionEnd ?? null
  const pastDueAt = garage?.pastDueAt ?? null
  const hasStripeSubscription = !!garage?.stripeSubscriptionId
  const subscriptionActive = isGarageAccessAllowed({ subscriptionStatus, trialEndsAt, subscriptionEnd, pastDueAt })
  const trialDaysLeft = subscriptionStatus === "trialing" ? garageTrialDaysLeft(trialEndsAt) : null
  const graceDaysLeft = subscriptionStatus === "past_due" ? garageGraceDaysLeft(pastDueAt) : null

  return { garageId: user.garageId, approved, hasServices, hasAvailability, isLive, subscriptionActive, subscriptionStatus, trialDaysLeft, graceDaysLeft, hasStripeSubscription }
})

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

function SetupPrompt() {
  return (
    <>
      <Navbar role="garage_owner" />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 32px" }}>
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
      </main>
    </>
  )
}

function NotLiveBanner() {
  return (
    <div style={{
      background: "#fffbeb",
      borderBottom: "0.5px solid rgba(234,179,8,0.3)",
      padding: "10px 32px",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <p style={{ fontSize: "0.85rem", color: "#92400e", margin: 0 }}>
          <strong>Your garage is not yet live</strong> — it won&apos;t appear in search results until all setup steps are complete.
        </p>
        <Link
          href="/garage-dashboard"
          style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          See what&apos;s needed →
        </Link>
      </div>
    </div>
  )
}

function CardRequiredBanner({ daysLeft }: { daysLeft: number }) {
  const urgent = daysLeft <= 7
  return (
    <div style={{
      background: urgent ? "#fef2f2" : "#fffbeb",
      borderBottom: `0.5px solid ${urgent ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)"}`,
      padding: "10px 32px",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <p style={{ fontSize: "0.85rem", color: urgent ? "#991b1b" : "#92400e", margin: 0 }}>
          <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""} left on your free trial</strong>
          {" — add a payment method now so your dashboard stays live automatically."}
        </p>
        <Link
          href="/pricing"
          style={{ fontSize: "0.8rem", fontWeight: 600, color: urgent ? "#991b1b" : "#92400e", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          Add card →
        </Link>
      </div>
    </div>
  )
}

function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const urgent = daysLeft <= 7
  return (
    <div style={{
      background: urgent ? "#fef2f2" : "#fffbeb",
      borderBottom: `0.5px solid ${urgent ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)"}`,
      padding: "10px 32px",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <p style={{ fontSize: "0.85rem", color: urgent ? "#991b1b" : "#92400e", margin: 0 }}>
          <strong>{daysLeft} day{daysLeft !== 1 ? "s" : ""} left on your free trial</strong>
          {" — you'll be billed automatically when it ends."}
        </p>
        <Link
          href="/pricing"
          style={{ fontSize: "0.8rem", fontWeight: 600, color: urgent ? "#991b1b" : "#92400e", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          View plan →
        </Link>
      </div>
    </div>
  )
}

function PastDueBanner({ daysLeft }: { daysLeft: number }) {
  return (
    <div style={{
      background: "#fef2f2",
      borderBottom: "0.5px solid rgba(239,68,68,0.3)",
      padding: "10px 32px",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <p style={{ fontSize: "0.85rem", color: "#991b1b", margin: 0 }}>
          <strong>Payment failed</strong>
          {daysLeft > 0
            ? ` — update your payment method within ${daysLeft} day${daysLeft !== 1 ? "s" : ""} to avoid losing access.`
            : " — your access will be suspended until payment is resolved."}
        </p>
        <Link
          href="/pricing"
          style={{ fontSize: "0.8rem", fontWeight: 600, color: "#991b1b", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          Update payment →
        </Link>
      </div>
    </div>
  )
}

function SubscriptionWall() {
  return (
    <>
      <Navbar role="garage_owner" />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center", maxWidth: "520px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.4rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "10px" }}>
            Your free trial has ended
          </h2>
          <p style={{ color: "#6b6a66", marginBottom: "12px", lineHeight: 1.6, fontSize: "0.95rem" }}>
            Subscribe to Garage Pro to continue managing bookings, availability, and settings.
          </p>
          <p style={{ color: "#111110", fontWeight: 700, fontSize: "1.1rem", marginBottom: "28px" }}>£100/month</p>
          <Link
            href="/pricing"
            style={{ background: "#111110", color: "#ffffff", padding: "12px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}
          >
            Subscribe now
          </Link>
        </div>
      </main>
    </>
  )
}

export default async function GarageDashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) return <NotAuthorized />

  const ctx = await getGarageOwnerContext(userId)
  if (!ctx) return <NotAuthorized />
  if (!ctx.garageId) return <SetupPrompt />

  if (!ctx.subscriptionActive) return <SubscriptionWall />

  return (
    <>
      <Navbar role="garage_owner" />
      {ctx.subscriptionStatus === "past_due" && ctx.graceDaysLeft !== null && (
        <PastDueBanner daysLeft={ctx.graceDaysLeft} />
      )}
      {ctx.subscriptionStatus === "trialing" && ctx.trialDaysLeft !== null && ctx.trialDaysLeft <= 14 && (
        ctx.hasStripeSubscription
          ? <TrialBanner daysLeft={ctx.trialDaysLeft} />
          : <CardRequiredBanner daysLeft={ctx.trialDaysLeft} />
      )}
      {!ctx.isLive && <NotLiveBanner />}
      {children}
    </>
  )
}
