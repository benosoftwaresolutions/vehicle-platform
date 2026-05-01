"use client"

import { useState, useEffect } from "react"

export default function EnvironmentBanner() {
  const envLabel = process.env.NEXT_PUBLIC_ENV
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (envLabel && envLabel !== "production" && !sessionStorage.getItem("env-banner-dismissed")) {
      setVisible(true)
    }
  }, [envLabel])

  if (!visible) return null

  function dismiss() {
    sessionStorage.setItem("env-banner-dismissed", "1")
    setVisible(false)
  }

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
        onClick={dismiss}
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
