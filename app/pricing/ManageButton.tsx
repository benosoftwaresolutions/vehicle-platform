"use client"

import { useState } from "react"

export default function ManageButton({ entity, label }: { entity: string; label: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/subscriptions/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entity }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError(data.error || "Something went wrong — please try again")
    } catch {
      setError("Something went wrong — please try again")
    }
    setLoading(false)
  }

  return (
    <>
    {error && <p style={{ fontSize: "0.8rem", color: "#ef4444", marginBottom: 8 }}>{error}</p>}
    <button
      onClick={handleClick}
      disabled={loading}
      style={{ width: "100%", background: "transparent", color: "#6b6a66", padding: "11px 20px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "0.5px solid rgba(0,0,0,0.15)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
    >
      {loading ? "Loading…" : label}
    </button>
    </>
  )
}
