"use client"

import { useState } from "react"

export default function ManageButton({ entity, label }: { entity: string; label: string }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    const res = await fetch("/api/subscriptions/portal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      style={{ width: "100%", background: "transparent", color: "#6b6a66", padding: "11px 20px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "0.5px solid rgba(0,0,0,0.15)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
    >
      {loading ? "Loading…" : label}
    </button>
  )
}
