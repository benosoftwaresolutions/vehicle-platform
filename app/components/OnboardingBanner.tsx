"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"

const DISMISS_KEY = "onboarding_banner_dismissed"
const listeners = new Set<() => void>()

// Same external-store approach as EnvironmentBanner: reads localStorage via
// useSyncExternalStore instead of useState+useEffect, so there's no
// effect-driven extra render pass and no server/client value to reconcile
// after the fact.
function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot() {
  return localStorage.getItem(DISMISS_KEY) !== null
}

function getServerSnapshot() {
  return true // unknown on the server — default to hidden, same as before
}

function dismissBanner() {
  localStorage.setItem(DISMISS_KEY, "1")
  listeners.forEach(l => l())
}

export default function OnboardingBanner() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (dismissed) return null

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
        onClick={dismissBanner}
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
