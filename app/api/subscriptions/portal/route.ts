import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getStripe } from "@/app/lib/stripe"
import { prisma } from "@/app/lib/prisma"
import { env } from "@/app/lib/env"

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const { entity } = await req.json()

  let stripeCustomerId: string | null = null

  if (entity === "user") {
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { stripeCustomerId: true } })
    stripeCustomerId = user?.stripeCustomerId ?? null
  } else if (entity === "garage") {
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true } })
    if (user?.garageId) {
      const garage = await prisma.garage.findUnique({ where: { id: user.garageId }, select: { stripeCustomerId: true } })
      stripeCustomerId = garage?.stripeCustomerId ?? null
    }
  }

  if (!stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 })
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: entity === "garage" ? `${env.appUrl}/garage-dashboard` : `${env.appUrl}/vehicles`,
  })

  return NextResponse.json({ url: session.url })
}
