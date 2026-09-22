"use client"

import { useSyncExternalStore } from "react"

const DISMISS_KEY = "env-banner-dismissed"
const listeners = new Set<() => void>()

// A tiny external store over sessionStorage, read with useSyncExternalStore
// instead of useState+useEffect: correct during SSR (server snapshot is
// always "not dismissed" — the env check below hides the banner there
// anyway) and avoids the extra effect-driven render pass on mount.
function subscribe(callback: () => void) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot() {
  return sessionStorage.getItem(DISMISS_KEY) === "1"
}

function getServerSnapshot() {
  return false
}

function dismissBanner() {
  sessionStorage.setItem(DISMISS_KEY, "1")
  listeners.forEach(l => l())
}

export default function EnvironmentBanner() {
  const envLabel = process.env.NEXT_PUBLIC_ENV
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!envLabel || envLabel === "production" || dismissed) return null

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 9999,
      background: "#111110",
      color: "#ffffff",
      fontSize: 12,
      fontWeight: 500,
      textAlign: "center",
      padding: "5px 40px 5px 16px",
      letterSpacing: "0.02em",
    }}>
      ⚠ {envLabel === "preview" ? "Preview" : "Dev"} environment — this is not the live site
      <button
        onClick={dismissBanner}
        aria-label="Dismiss"
        style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", color: "#ffffff", cursor: "pointer",
          fontSize: 16, lineHeight: 1, padding: "2px 4px", opacity: 0.7,
        }}
      >
        ×
      </button>
    </div>
  )
}
