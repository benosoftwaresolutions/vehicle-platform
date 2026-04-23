"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const DISMISS_KEY = "onboarding_banner_dismissed"

export default function OnboardingBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) setVisible(true)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1")
    setVisible(false)
  }

  return (
    <div style={{
      background: "#f4f3ef",
      borderBottom: "0.5px solid rgba(0,0,0,0.10)",
      padding: "10px 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "0.875rem", color: "#444441", fontWeight: 500 }}>
          Your profile isn&apos;t complete.
        </span>
        <Link
          href="/onboarding"
          style={{
            background: "#111110",
            color: "#ffffff",
            padding: "6px 16px",
            borderRadius: 100,
            fontWeight: 600,
            fontSize: "0.8rem",
            textDecoration: "none",
          }}
        >
          Complete your profile
        </Link>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#6b6a66", fontSize: "1rem", lineHeight: 1, padding: "4px",
        }}
      >
        ✕
      </button>
    </div>
  )
}
