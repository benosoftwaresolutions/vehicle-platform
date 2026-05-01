import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { cookies } from "next/headers"
import OnboardingFlow from "@/app/components/OnboardingFlow"
import Link from "next/link"

export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) return <GoHome />

  let user = await prisma.user.findUnique({ where: { clerkId: userId } })

  if (!user) {
    const clerkUser = await currentUser().catch(() => null)
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ""

    // Claim an existing row with the same email (stale clerkId from old data)
    if (email) {
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

  // Already onboarded — set cookie and send them to the right place
  if (user.onboardingStep >= 2 && user.role !== "pending") {
    const cookieStore = await cookies()
    cookieStore.set("onboarding_complete", "1", {
      httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365,
    })
    return user.role === "garage_owner" ? <GoDashboard /> : <GoHome />
  }

  return <OnboardingFlow user={user} />
}

function GoHome() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#6b6a66", marginBottom: 16 }}>You&apos;re all set.</p>
        <Link href="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  )
}

function GoDashboard() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#6b6a66", marginBottom: 16 }}>Your account is already set up.</p>
        <Link href="/garage-dashboard" className="btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  )
}
