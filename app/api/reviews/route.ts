import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { rateLimit } from "@/app/lib/rateLimit"
import { headers } from "next/headers"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown"
    if (!await rateLimit(`reviews:${ip}`, 3, 60_000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { garageId, rating, comment } = await req.json()

    if (!garageId || !rating || !comment?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return NextResponse.json({ error: "Rating must be an integer 1–5" }, { status: 400 })
    }
    if (comment.trim().length < 3 || comment.trim().length > 1000) {
      return NextResponse.json({ error: "Comment must be 3–1000 characters" }, { status: 400 })
    }

    // Must have a confirmed booking at this garage
    const confirmedBooking = await prisma.booking.findFirst({
      where: { garageId, clerkId: userId, status: "confirmed" },
    })
    if (!confirmedBooking) {
      return NextResponse.json({ error: "You must have a confirmed booking to leave a review" }, { status: 403 })
    }

    // Must not have already reviewed
    const existing = await prisma.review.findUnique({
      where: { garageId_clerkId: { garageId, clerkId: userId } },
    })
    if (existing) {
      return NextResponse.json({ error: "You have already reviewed this garage" }, { status: 409 })
    }

    const customer = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { name: true, email: true },
    })

    const review = await prisma.review.create({
      data: {
        garageId,
        clerkId: userId,
        customerName: customer?.name ?? customer?.email ?? "Customer",
        rating,
        comment: comment.trim(),
      },
    })

    // Recalculate average rating
    const agg = await prisma.review.aggregate({
      where: { garageId },
      _avg: { rating: true },
    })
    await prisma.garage.update({
      where: { id: garageId },
      data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10 },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error("Review error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
