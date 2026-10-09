import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/bookings(.*)",
  "/garage-dashboard(.*)",
  "/admin(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // "/" is a static page built for logged-out visitors (see app/page.tsx).
  // Signed-in users get their personal homepage instead: a REWRITE (not a
  // redirect) serves /home's content while the address bar stays on "/".
  // auth() here only verifies the session token locally — no network call —
  // so logged-out visitors still get the CDN-cached page at full speed.
  if (req.nextUrl.pathname === "/") {
    const { userId } = await auth()
    if (userId) return NextResponse.rewrite(new URL("/home", req.url))
  }
})

// Webhook routes are excluded from the matcher entirely. They carry no Clerk
// session, and running them through clerkMiddleware causes a 307 handshake
// redirect — which Stripe does not follow, so deliveries silently fail.
export const config = {
  matcher: [
    "/((?!_next|api/webhooks|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api(?!/webhooks)|trpc)(.*)",
  ],
}