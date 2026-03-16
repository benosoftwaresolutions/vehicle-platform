import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/bookings(.*)",
  "/garage-dashboard(.*)",
  "/owner-dashboard(.*)",
])

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"])
const isPublicRoute = createRouteMatcher(["/", "/garages(.*)", "/api/webhooks(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Not logged in and trying to access protected route
  if (!userId && isProtectedRoute(req)) {
    await auth.protect()
  }

  // Logged in but on a public route — check if they need onboarding
  if (userId && !isOnboardingRoute(req) && !isPublicRoute(req)) {
    const response = await fetch(`${req.nextUrl.origin}/api/onboarding-status`, {
      headers: { cookie: req.headers.get("cookie") || "" }
    })

    if (response.ok) {
      const data = await response.json()
      if (!data.onboarded) {
        return NextResponse.redirect(new URL("/onboarding", req.url))
      }
    }
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}