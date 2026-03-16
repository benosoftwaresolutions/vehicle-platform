import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import OnboardingFlow from "@/app/components/OnboardingFlow"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  let user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  // If no user record yet create one
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: "",
        role: "pending",
        onboardingStep: 0
      }
    })
  }

  // Already onboarded — redirect to correct dashboard
  if (user.onboardingStep >= 2 && user.role !== "pending") {
    if (user.role === "garage_owner") redirect("/garage-dashboard")
    else redirect("/")
  }

  return <OnboardingFlow user={user} />
}