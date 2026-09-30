"use client"

import { useRouter } from "next/navigation"
import { useAuth, useClerk } from "@clerk/nextjs"

// Hero CTA on /for-garages. Opens Clerk's sign-up modal (there is no /sign-up
// route); signed-in users go straight to /onboarding, which redirects them on.
export default function StartTrialButton({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { openSignUp } = useClerk()

  const handleClick = () => {
    if (isSignedIn) {
      router.push("/onboarding")
      return
    }
    openSignUp({ forceRedirectUrl: "/onboarding" })
  }

  return (
    <button type="button" onClick={handleClick} style={{ border: "none", cursor: "pointer", ...style }}>
      {children}
    </button>
  )
}
