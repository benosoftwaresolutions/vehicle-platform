"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { subscriptionTermsSummary } from "@/app/lib/subscriptionTerms"

// variant: "light" = white button (for dark cards, the default for garage_pro),
// "dark" = black button (for light backgrounds, e.g. the dashboard trial-ended wall).
export default function CheckoutButton({ plan, label, variant }: { plan: string; label: string; variant?: "light" | "dark" }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Consumer law requires the price, auto-renewal and cancellation terms to be
  // clear before the customer commits, and the tick gives us a record that they
  // agreed. The server refuses to start checkout without it.
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    if (!agreed) {
      setError("Please tick the box to agree to the terms first")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, acceptedTerms: agreed }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else if (res.status === 401) {
        router.push("/sign-in")
      } else {
        setError(data.error || "Something went wrong — please try again")
        setLoading(false)
      }
    } catch {
      setError("Something went wrong — please try again")
      setLoading(false)
    }
  }

  const isLight = variant ? variant === "light" : plan === "garage_pro"

  return (
    <>
    {error && <p style={{ fontSize: "0.8rem", color: "#ef4444", marginBottom: 8 }}>{error}</p>}
    <label style={{
      display: "flex", gap: 8, alignItems: "flex-start", textAlign: "left",
      fontSize: "0.75rem", lineHeight: 1.5, marginBottom: 10, cursor: "pointer",
      color: isLight ? "rgba(255,255,255,0.8)" : "#444441",
    }}>
      <input
        type="checkbox"
        checked={agreed}
        onChange={e => { setAgreed(e.target.checked); if (e.target.checked) setError(null) }}
        style={{ marginTop: 3, flexShrink: 0 }}
      />
      <span>
        I agree to the{" "}
        <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>Terms of Service</a>.{" "}
        {subscriptionTermsSummary(plan)}
      </span>
    </label>
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        width: "100%",
        background: isLight ? "#ffffff" : "#111110",
        color: isLight ? "#111110" : "#ffffff",
        padding: "11px 20px",
        borderRadius: 100,
        fontWeight: 600,
        fontSize: "0.875rem",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Loading…" : label}
    </button>
    </>
  )
}
