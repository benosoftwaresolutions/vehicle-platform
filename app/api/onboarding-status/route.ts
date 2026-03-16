import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ onboarded: false })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ onboarded: false })
    }

    return NextResponse.json({
      onboarded: user.onboardingStep >= 2 && user.role !== "pending",
      role: user.role,
      onboardingStep: user.onboardingStep
    })
  } catch (error) {
    return NextResponse.json({ onboarded: true }) // Fail safe — don't block the user
  }
}