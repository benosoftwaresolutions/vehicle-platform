import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import OnboardingFlow from "@/app/components/OnboardingFlow"
import AutoRedirect from "./AutoRedirect"

type Props = {
  searchParams: Promise<{ next?: string }>
}

// Only allow same-origin relative paths. startsWith("/") alone isn't enough:
// "//evil.com" and "/\evil.com" both start with a single "/" but browsers
// normalise them to a scheme-relative URL, i.e. they still navigate off-site —
// so both must be rejected too, or this "relative path" check is an open redirect.
function safeNext(value: string | undefined): string | undefined {
  if (!value) return undefined
  if (!value.startsWith("/")) return undefined
  if (value.startsWith("//") || value.startsWith("/\\")) return undefined
  return value
}

export default async function OnboardingPage({ searchParams }: Props) {
  const { userId } = await auth()
  if (!userId) return <AutoRedirect to="/" />

  const { next: rawNext } = await searchParams
  const next = safeNext(rawNext)

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

  // Already onboarded — auto-redirect without an intermediate screen
  // Garage owners must also have a garageId; without one they still need to complete setup
  const fullyOnboarded = user.onboardingStep >= 2 && user.role !== "pending" &&
    (user.role !== "garage_owner" || !!user.garageId)
  if (fullyOnboarded) {
    const defaultDest = user.role === "garage_owner" ? "/garage-dashboard" : "/"
    return <AutoRedirect to={next ?? defaultDest} />
  }

  // If role is set but garage wasn't created, jump straight to step 2 of the form
  const flowUser = (user.role === "garage_owner" && !user.garageId)
    ? { ...user, onboardingStep: 2 }
    : user

  return <OnboardingFlow user={flowUser} next={next} />
}
