import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher([
  "/bookings(.*)",
  "/garage-dashboard(.*)",
  "/admin(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
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