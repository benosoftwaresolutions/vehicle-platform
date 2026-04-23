"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function GarageSignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    router.push(`/sign-up?email=${encodeURIComponent(email.trim())}`)
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
