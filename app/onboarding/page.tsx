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

  // No record for this clerkId — webhook may not have fired, or there's a
  // stale row with the same email but a different clerkId (e.g. from a debug
  // endpoint). Claim the existing row by email if possible, otherwise create.
  if (!user) {
    const clerkUser = await currentUser().catch(() => null)
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ""

    if (email) {
      // Claim an existing row that has the right email but wrong clerkId
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        user = await prisma.user.update({
          where: { email },
          data: { clerkId: userId },
        })
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: email || userId,
          role: "pending",
          onboardingStep: 0,
        },
      })
    }
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