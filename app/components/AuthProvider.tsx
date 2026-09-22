"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

// Wraps ClerkProvider so the sign-up fallback redirect (used whenever a
// SignUpButton doesn't set its own forceRedirectUrl, e.g. the Navbar) carries
// the page the visitor signed up from as ?next=, instead of always sending
// everyone to /onboarding with no way back to where they started. Onboarding
// re-sanitises this before using it (see app/onboarding/page.tsx) — never
// trust it as-is just because it was built from a same-origin pathname here.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const signUpFallbackRedirectUrl = `/onboarding?next=${encodeURIComponent(pathname || "/")}`

  return (
    <ClerkProvider signInFallbackRedirectUrl="/onboarding" signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}>
      {children}
    </ClerkProvider>
  )
}
