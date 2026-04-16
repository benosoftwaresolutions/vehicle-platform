"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const DISMISS_KEY = "onboarding_banner_dismissed"

export default function OnboardingBanner() {
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
        <span style={{ fontSize: "1.25rem" }}>👤</span>
        <span style={{ fontSize: "0.9rem", color: "#78350f", fontWeight: 500 }}>
          Your profile isn&apos;t complete.
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
          Complete your profile
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
