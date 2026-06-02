import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { isGarageAccessAllowed } from "@/app/lib/subscription"
import { rateLimit } from "@/app/lib/rateLimit"
import Anthropic from "@anthropic-ai/sdk"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true } })
  if (!user?.garageId) return NextResponse.json({ error: "No garage" }, { status: 403 })

  const garage = await prisma.garage.findUnique({
    where: { id: user.garageId },
    select: { id: true, name: true, subscriptionStatus: true, trialEndsAt: true, subscriptionEnd: true },
  })
  if (!garage || !isGarageAccessAllowed(garage)) {
    return NextResponse.json({ error: "Not available on your plan" }, { status: 403 })
  }

  const allowed = await rateLimit(`insights:${garage.id}`, 1, 24 * 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "RATE_LIMITED", message: "AI insights can only be generated once per day. Come back tomorrow." }, { status: 429 })
  }

  const fourWeeksAhead = new Date()
  fourWeeksAhead.setDate(fourWeeksAhead.getDate() + 28)

  const [parts, upcomingBookings, recentBookings] = await Promise.all([
    prisma.part.findMany({ where: { garageId: garage.id }, orderBy: { name: "asc" } }),
    prisma.booking.findMany({
      where: { garageId: garage.id, date: { gte: new Date(), lte: fourWeeksAhead }, status: { not: "canceled" } },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      where: { garageId: garage.id, status: "completed" },
      orderBy: { date: "desc" },
      take: 50,
    }),
  ])

  if (parts.length === 0) {
    return NextResponse.json({ insights: null, reason: "no_parts" })
  }

  const client = new Anthropic()

  const prompt = `You are a business efficiency assistant for an independent UK garage called "${garage.name}".

CURRENT INVENTORY:
${parts.map(p => `- ${p.name} (${p.category ?? "general"}): ${p.quantity} ${p.unit} in stock, reorder at ${p.reorderLevel} ${p.unit}${p.supplier ? `, supplier: ${p.supplier}` : ""}${p.costPrice ? `, cost: £${p.costPrice}` : ""}`).join("\n")}

UPCOMING BOOKINGS (next 4 weeks):
${upcomingBookings.length === 0 ? "None booked yet" : upcomingBookings.map(b => `- ${new Date(b.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: ${b.service}${b.vehicleMake ? ` (${b.vehicleMake} ${b.vehicleModel ?? ""})`.trimEnd() : ""}`).join("\n")}

RECENT COMPLETED JOBS (last 50):
${recentBookings.length === 0 ? "No history yet" : recentBookings.map(b => `- ${b.service}`).join("\n")}

Based on this data, provide practical insights in this exact JSON format (no markdown, just JSON):
{
  "summary": "one sentence overview of the garage's stock situation",
  "lowStock": [
    { "part": "part name", "current": 0, "reorderLevel": 0, "unit": "units", "urgency": "high|medium|low", "reason": "why it's needed soon" }
  ],
  "predictions": [
    { "part": "part name", "predictedNeed": 0, "unit": "units", "timeframe": "next 2 weeks", "confidence": "high|medium|low", "basedOn": "brief explanation" }
  ],
  "orderSuggestion": "one paragraph recommendation on what to order and when",
  "efficiency": "one tip to improve parts management efficiency"
}`

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : ""
    const insights = JSON.parse(text)
    return NextResponse.json({ insights, parts, upcomingBookings: upcomingBookings.length })
  } catch (err) {
    console.error("Insights error:", err)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
