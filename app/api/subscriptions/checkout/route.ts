import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getStripe, PLANS } from "@/app/lib/stripe"
import { prisma } from "@/app/lib/prisma"
import { subscriptionTermsSummary, TERMS_VERSION } from "@/app/lib/subscriptionTerms"

// Statuses that mean "already has a live subscription — don't create another"
const LIVE_STATUSES = ["active", "trialing", "past_due"]

async function portalUrlForExistingSubscription(
  entity: { stripeSubscriptionId: string | null; stripeCustomerId: string | null; subscriptionStatus: string | null },
  returnUrl: string
): Promise<string | null> {
  if (!entity.stripeSubscriptionId || !entity.stripeCustomerId) return null
  if (!LIVE_STATUSES.includes(entity.subscriptionStatus ?? "")) return null

  const session = await getStripe().billingPortal.sessions.create({
    customer: entity.stripeCustomerId,
    return_url: returnUrl,
  })
  return session.url
}

export async function POST(req: Request) {
  try {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const origin = new URL(req.url).origin
  const { plan, acceptedTerms } = await req.json()

  // The pricing page makes the customer tick to accept the terms (price,
  // auto-renewal, cancellation). Refuse to start checkout without it, and
  // record which version they accepted on the Stripe session and subscription.
  if (acceptedTerms !== true) {
    return NextResponse.json({ error: "Please tick the box to agree to the terms first" }, { status: 400 })
  }
  const consent = { termsVersion: TERMS_VERSION, termsAcceptedAt: new Date().toISOString() }

  if (plan === "driver_pro") {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Already subscribed → manage in the portal instead of double-billing
    const portalUrl = await portalUrlForExistingSubscription(user, `${origin}/vehicles`)
    if (portalUrl) return NextResponse.json({ url: portalUrl })

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: user.stripeCustomerId ? undefined : user.email,
      customer: user.stripeCustomerId ?? undefined,
      line_items: [{ price: PLANS.DRIVER_PRO.priceId, quantity: 1 }],
      success_url: `${origin}/vehicles?upgraded=1`,
      cancel_url: `${origin}/pricing`,
      metadata: { entity: "user", entityId: user.id, plan: "driver_pro", ...consent },
      subscription_data: { metadata: consent },
      custom_text: { submit: { message: subscriptionTermsSummary("driver_pro") } },
    })

    return NextResponse.json({ url: session.url })
  }

  if (plan === "garage_pro") {
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true, email: true } })
    if (!user?.garageId) return NextResponse.json({ error: "No garage found" }, { status: 404 })

    const garage = await prisma.garage.findUnique({ where: { id: user.garageId }, select: { id: true, stripeCustomerId: true, stripeSubscriptionId: true, subscriptionStatus: true, trialEndsAt: true } })
    if (!garage) return NextResponse.json({ error: "Garage not found" }, { status: 404 })

    // Already subscribed → manage in the portal instead of double-billing
    const portalUrl = await portalUrlForExistingSubscription(garage, `${origin}/garage-dashboard`)
    if (portalUrl) return NextResponse.json({ url: portalUrl })

    // Use remaining trial days so Stripe trial matches what's left of the DB trial
    const trialDaysLeft = garage.trialEndsAt
      ? Math.ceil((garage.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 30
    const subscriptionData = trialDaysLeft > 0
      ? { trial_period_days: trialDaysLeft, metadata: consent }
      : { metadata: consent }

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_collection: "always",
      customer_email: garage.stripeCustomerId ? undefined : user.email,
      customer: garage.stripeCustomerId ?? undefined,
      line_items: [{ price: PLANS.GARAGE_PRO.priceId, quantity: 1 }],
      subscription_data: subscriptionData,
      success_url: `${origin}/garage-dashboard?subscribed=1`,
      cancel_url: `${origin}/garage-dashboard`,
      metadata: { entity: "garage", entityId: garage.id, plan: "garage_pro", ...consent },
      custom_text: { submit: { message: subscriptionTermsSummary("garage_pro") } },
    })

    return NextResponse.json({ url: session.url })
  }

  return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  } catch (err) {
    // Full details go to the server logs only. Returning String(err) sent
    // Stripe's raw error (price IDs, account details, request IDs) to the browser.
    console.error("Checkout error:", err)
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again, or contact hello@fyca.co.uk if it keeps happening." },
      { status: 500 },
    )
  }
}
