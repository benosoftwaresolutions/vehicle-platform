import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import OnboardingFlow from "@/app/components/OnboardingFlow"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  let user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  // Webhook hasn't fired yet — create the record using the real email from Clerk
  // so we don't hit the unique constraint on the email field with an empty string
  if (!user) {
    const clerkUser = await currentUser().catch(() => null)
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? userId
    user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {},
      create: {
        clerkId: userId,
        email,
        role: "pending",
        onboardingStep: 0,
      },
    })
  }

  // Already onboarded — set the cookie (covers cleared-cookies and pre-deploy users)
  // then redirect to the correct dashboard
  if (user.onboardingStep >= 2 && user.role !== "pending") {
    const cookieStore = await cookies()
    cookieStore.set("onboarding_complete", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
    if (user.role === "garage_owner") redirect("/garage-dashboard")
    else redirect("/")
  }

  return <OnboardingFlow user={user} />
}