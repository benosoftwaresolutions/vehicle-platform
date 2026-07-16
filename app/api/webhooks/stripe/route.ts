import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getStripe } from "@/app/lib/stripe"
import { prisma } from "@/app/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(sub)
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(sub)
        break
      }
    }
  } catch (err) {
    console.error("Stripe webhook error:", err)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// In Stripe API v2025+ (basil), current_period_end lives on the subscription
// items rather than the subscription itself.
function getSubscriptionPeriodEnd(sub: Stripe.Subscription | null): Date | null {
  const periodEnd = sub?.items.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000) : null
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { entity, entityId, plan } = session.metadata ?? {}
  if (!entity || !entityId || !plan) return

  const sub = session.subscription
    ? await getStripe().subscriptions.retrieve(session.subscription as string)
    : null

  const subscriptionEnd = getSubscriptionPeriodEnd(sub)
  // A garage checking out mid-trial gets a Stripe subscription in "trialing"
  // status — mirror Stripe rather than assuming "active"
  const status = sub?.status ?? "active"

  if (entity === "user") {
    await prisma.user.update({
      where: { id: entityId },
      data: {
        plan: "driver_pro",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: sub?.id ?? null,
        subscriptionStatus: status,
        subscriptionEnd,
      },
    })
  } else if (entity === "garage") {
    await prisma.garage.update({
      where: { id: entityId },
      data: {
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: sub?.id ?? null,
        subscriptionStatus: status,
        subscriptionEnd,
        pastDueAt: null,
      },
    })
  }
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const subscriptionEnd = getSubscriptionPeriodEnd(sub)
  const status = sub.status

  const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } })
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionStatus: status,
        subscriptionEnd,
        plan: status === "canceled" ? "driver_free" : user.plan,
      },
    })
    return
  }

  const garage = await prisma.garage.findFirst({ where: { stripeSubscriptionId: sub.id }, select: { id: true, pastDueAt: true } })
  if (garage) {
    // Track when payment first goes past_due; clear it if payment recovers
    const pastDueAt = status === "past_due"
      ? (garage.pastDueAt ?? new Date())
      : null

    await prisma.garage.update({
      where: { id: garage.id },
      data: { subscriptionStatus: status, subscriptionEnd, pastDueAt },
    })
  }
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } })
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "driver_free", subscriptionStatus: "canceled", stripeSubscriptionId: null },
    })
    return
  }

  const garage = await prisma.garage.findFirst({ where: { stripeSubscriptionId: sub.id }, select: { id: true } })
  if (garage) {
    await prisma.garage.update({
      where: { id: garage.id },
      data: { subscriptionStatus: "canceled", stripeSubscriptionId: null, pastDueAt: null },
    })
  }
}
