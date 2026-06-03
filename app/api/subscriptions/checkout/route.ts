import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getStripe, PLANS } from "@/app/lib/stripe"
import { prisma } from "@/app/lib/prisma"
import { env } from "@/app/lib/env"

export async function POST(req: Request) {
  try {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { plan } = await req.json()

  if (plan === "driver_pro") {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: user.stripeCustomerId ? undefined : user.email,
      customer: user.stripeCustomerId ?? undefined,
      line_items: [{ price: PLANS.DRIVER_PRO.priceId, quantity: 1 }],
      success_url: `${env.appUrl}/vehicles?upgraded=1`,
      cancel_url: `${env.appUrl}/pricing`,
      metadata: { entity: "user", entityId: user.id, plan: "driver_pro" },
    })

    return NextResponse.json({ url: session.url })
  }

  if (plan === "garage_pro") {
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true, email: true } })
    if (!user?.garageId) return NextResponse.json({ error: "No garage found" }, { status: 404 })

    const garage = await prisma.garage.findUnique({ where: { id: user.garageId } })
    if (!garage) return NextResponse.json({ error: "Garage not found" }, { status: 404 })

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer_email: garage.stripeCustomerId ? undefined : user.email,
      customer: garage.stripeCustomerId ?? undefined,
      line_items: [{ price: PLANS.GARAGE_PRO.priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 30 },
      success_url: `${env.appUrl}/garage-dashboard?subscribed=1`,
      cancel_url: `${env.appUrl}/pricing`,
      metadata: { entity: "garage", entityId: garage.id, plan: "garage_pro" },
    })

    return NextResponse.json({ url: session.url })
  }

  return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
