import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import Navbar from "@/app/components/Navbar"
import FycaFooter from "@/app/components/FycaFooter"
import CheckoutButton from "./CheckoutButton"
import ManageButton from "./ManageButton"
import type { Metadata } from "next"

// Trial end shown as a date rather than a day count — unambiguous, and it
// matches what Stripe shows the same garage owner on their invoice.
function formatTrialEnd(d: Date | null): string | null {
  if (!d) return null
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Pricing — Fyca",
  description: "Simple, transparent pricing for drivers and garages. Start free, upgrade when you need more.",
}

export default async function PricingPage() {
  const { userId } = await auth()

  let role: string | undefined
  let isDriverPro = false
  let isGarageActive = false
  let isGarageTrialing = false
  let garageHasCard = false
  let trialEndsAt: Date | null = null
  let subscriptionEnd: Date | null = null

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, plan: true, subscriptionStatus: true, garageId: true },
    })
    role = user?.role
    isDriverPro = user?.plan === "driver_pro" && user?.subscriptionStatus === "active"

    if (user?.garageId) {
      const garage = await prisma.garage.findUnique({
        where: { id: user.garageId },
        select: { subscriptionStatus: true, trialEndsAt: true, stripeSubscriptionId: true, subscriptionEnd: true },
      })
      isGarageActive = garage?.subscriptionStatus === "active"
      isGarageTrialing = garage?.subscriptionStatus === "trialing"
      garageHasCard = !!garage?.stripeSubscriptionId
      trialEndsAt = garage?.trialEndsAt ?? null
      subscriptionEnd = garage?.subscriptionEnd ?? null
    }
  }

  const trialEndLabel = formatTrialEnd(trialEndsAt)
  const nextBillingLabel = formatTrialEnd(subscriptionEnd)

  // A subscribed garage is reading an account summary, not a sales pitch — drop
  // the trial line from the feature list and lead with what they're paying for.
  const GARAGE_FEATURES = [
    "Online booking management",
    "Calendar & availability",
    "Customer reviews",
    "Revenue tracking",
    "Walk-in bookings",
    "AI parts predictions",
    "Inventory management",
  ]
  const garageFeatures = isGarageActive
    ? GARAGE_FEATURES
    : ["1 month free trial", ...GARAGE_FEATURES]

  const isGarageOwner = role === "garage_owner"
  const isDriver = role === "customer"

  return (
    <>
      <Navbar role={role} />
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: 10 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "1rem" }}>Start free. Upgrade when you need more.</p>
        </div>
      </div>

      <main className="page-body" style={{ maxWidth: 820, margin: "0 auto", padding: "48px 32px" }}>

        {/* Garage owner — only show Garage Pro */}
        {isGarageOwner && (
          <div style={{ maxWidth: 380, margin: "0 auto" }}>
            {isGarageTrialing && garageHasCard && (
              <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "24px 26px", marginBottom: 16 }}>
                <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.2rem", letterSpacing: "-0.02em", color: "#111110", margin: "0 0 6px" }}>
                  Thank you for starting your free trial
                </p>
                <p style={{ fontSize: "0.875rem", color: "#6b6a66", margin: "0 0 16px", lineHeight: 1.5 }}>
                  {trialEndLabel
                    ? <>Your free trial ends on {trialEndLabel}. You&apos;ll be billed automatically then — no action needed.</>
                    : <>You&apos;ll be billed automatically when your trial ends — no action needed.</>}
                </p>
                <ManageButton entity="garage" label="Manage subscription" />
              </div>
            )}
            {isGarageTrialing && !garageHasCard && (
              <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "24px 26px", marginBottom: 16 }}>
                <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.2rem", letterSpacing: "-0.02em", color: "#111110", margin: "0 0 6px" }}>
                  Your free trial is under way
                </p>
                <p style={{ fontSize: "0.875rem", color: "#6b6a66", margin: "0 0 16px", lineHeight: 1.5 }}>
                  {trialEndLabel
                    ? <>Your free trial ends on {trialEndLabel}. Add a payment method before then to keep taking bookings — you won&apos;t be charged until the trial is over.</>
                    : <>Add a payment method before your trial ends to keep taking bookings — you won&apos;t be charged until the trial is over.</>}
                </p>
                <CheckoutButton plan="garage_pro" label="Add payment method" />
              </div>
            )}
            {!isGarageTrialing && (
              <PlanCard
                name="Garage Pro"
                price="£99.99/month"
                description={
                  isGarageActive
                    ? nextBillingLabel
                      ? `Your subscription is active. Next payment ${nextBillingLabel}.`
                      : "Your subscription is active."
                    : "The complete platform for independent garages."
                }
                features={garageFeatures}
                cta={
                  isGarageActive
                    ? <ManageButton entity="garage" label="Manage billing" />
                    : <CheckoutButton plan="garage_pro" label="Start free trial" />
                }
                highlight={true}
                badge={isGarageActive ? "Active" : undefined}
              />
            )}
          </div>
        )}

        {/* Driver — show driver plans only */}
        {(isDriver || !userId) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            <PlanCard
              name="Driver"
              price="Free"
              description="Everything you need to keep track of one vehicle."
              features={["1 vehicle", "MOT & service date tracking", "Booking with local garages"]}
              cta={null}
              highlight={false}
              badge={!isDriverPro && userId ? "Current plan" : undefined}
            />
            <PlanCard
              name="Pro Vehicle Owner"
              price="£7/month"
              description="For drivers with multiple vehicles who want full visibility."
              features={["Unlimited vehicles", "MOT & service reminders", "Full service history", "Priority support"]}
              cta={
                isDriverPro
                  ? <ManageButton entity="user" label="Manage billing" />
                  : <CheckoutButton plan="driver_pro" label="Upgrade to Pro — £7/month" />
              }
              highlight={true}
              badge={isDriverPro ? "Active" : undefined}
            />
          </div>
        )}

        {/* Not signed in — show all plans */}
        {!userId && (
          <div style={{ maxWidth: 380, margin: "32px auto 0" }}>
            <PlanCard
              name="Garage Pro"
              price="£99.99/month"
              description="The complete platform for independent garages."
              features={[
                "1 month free trial",
                "Online booking management",
                "Calendar & availability",
                "Customer reviews",
                "Revenue tracking",
                "Walk-in bookings",
                "AI parts predictions",
                "Inventory management",
              ]}
              cta={<CheckoutButton plan="garage_pro" label="Start free trial" />}
              highlight={false}
            />
          </div>
        )}

        <p style={{ textAlign: "center", color: "#aaa9a4", fontSize: "0.8rem", marginTop: 40 }}>
          All plans are billed monthly. Cancel any time. Prices include VAT.
        </p>
      </main>

      <FycaFooter />
    </>
  )
}

function PlanCard({ name, price, description, features, cta, highlight, badge }: {
  name: string
  price: string
  description: string
  features: string[]
  cta: React.ReactNode | null
  highlight: boolean
  badge?: string
}) {
  return (
    <div style={{
      background: highlight ? "#111110" : "#f4f3ef",
      borderRadius: 16,
      padding: "28px 26px",
      display: "flex",
      flexDirection: "column",
      border: highlight ? "none" : "0.5px solid rgba(0,0,0,0.06)",
      position: "relative",
    }}>
      {badge && (
        <span style={{
          position: "absolute", top: 16, right: 16,
          background: highlight ? "rgba(255,255,255,0.15)" : "#111110",
          color: highlight ? "#ffffff" : "#ffffff",
          fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: 100,
        }}>{badge}</span>
      )}
      <p style={{ fontSize: "0.78rem", fontWeight: 700, color: highlight ? "rgba(255,255,255,0.5)" : "#aaa9a4", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>
        {name}
      </p>
      <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.04em", color: highlight ? "#ffffff" : "#111110", margin: "0 0 10px" }}>
        {price}
      </p>
      <p style={{ fontSize: "0.875rem", color: highlight ? "rgba(255,255,255,0.65)" : "#6b6a66", margin: "0 0 24px", lineHeight: 1.5 }}>
        {description}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 9 }}>
        {features.map(f => (
          <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.875rem", color: highlight ? "rgba(255,255,255,0.85)" : "#444441" }}>
            <span style={{ color: highlight ? "rgba(255,255,255,0.5)" : "#111110", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
      {cta && <div style={{ marginTop: "auto" }}>{cta}</div>}
    </div>
  )
}

