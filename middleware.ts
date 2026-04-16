import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/bookings(.*)",
  "/garage-dashboard(.*)",
  "/owner-dashboard(.*)",
])

const isOnboardingRoute = createRouteMatcher(["/onboarding(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Authenticated users who haven't completed onboarding get sent to /onboarding.
  // We track completion via a cookie set by the onboarding API on step 2, so there
  // are no JWT token-cache timing issues.
  if (
    userId &&
    !isOnboardingRoute(req) &&
    !req.nextUrl.pathname.startsWith("/api/") &&
    !req.nextUrl.pathname.startsWith("/sign-in") &&
    !req.nextUrl.pathname.startsWith("/sign-up")
  ) {
    const onboardingComplete = req.cookies.get("onboarding_complete")?.value === "1"
    if (!onboardingComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}