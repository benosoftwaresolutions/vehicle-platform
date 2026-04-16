"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type Props = {
  role: string
}

const DISMISS_KEY = "onboarding_banner_dismissed"

export default function OnboardingBanner({ role }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if the user hasn't already dismissed this session
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (!dismissed) setVisible(true)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1")
    setVisible(false)
  }

  const isGarageOwner = role === "garage_owner"

  return (
    <div style={{
      background: "#fefce8",
      borderBottom: "1px solid #fde68a",
      padding: "12px 32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "1.25rem" }}>{isGarageOwner ? "🔧" : "👤"}</span>
        <span style={{ fontSize: "0.9rem", color: "#78350f", fontWeight: 500 }}>
          {isGarageOwner
            ? "Your garage isn't set up yet. Add your details to start accepting bookings."
            : "Your profile isn't complete. Finish setting up to book a garage."}
        </span>
        <Link
          href="/onboarding"
          style={{
            background: "#f59e0b",
            color: "#0f172a",
            padding: "6px 16px",
            borderRadius: "8px",
            fontWeight: 700,
            fontSize: "0.8rem",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {isGarageOwner ? "Set up garage" : "Complete profile"}
        </Link>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#92400e",
          fontSize: "1.1rem",
          lineHeight: 1,
          padding: "4px",
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}
