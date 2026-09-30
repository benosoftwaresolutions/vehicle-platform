"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useClerk } from "@clerk/nextjs"

// There is no /sign-up page — sign-up happens in Clerk's modal (same as the
// Navbar). Open that modal with the email pre-filled, then send the new user
// to /onboarding, which routes garage owners on to their dashboard.
export default function GarageSignupForm() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { openSignUp } = useClerk()
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    if (isSignedIn) {
      router.push("/onboarding")
      return
    }
    openSignUp({
      initialValues: { emailAddress: trimmed },
      forceRedirectUrl: "/onboarding",
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 28 }}
    >
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
        style={{
          flex: "1 1 240px", maxWidth: 320,
          border: "0.5px solid rgba(255,255,255,0.25)",
          borderRadius: 100,
          padding: "13px 20px",
          fontSize: "0.95rem",
          background: "rgba(255,255,255,0.10)",
          color: "#ffffff",
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          background: "#ffffff", color: "#111110",
          padding: "13px 28px", borderRadius: 100,
          fontWeight: 700, fontSize: "0.95rem",
          border: "none", cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        Get listed
      </button>
    </form>
  )
}
