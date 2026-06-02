"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CheckoutButton({ plan, label }: { plan: string; label: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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

  const isGarage = plan === "garage_pro"

  return (
    <>
    {error && <p style={{ fontSize: "0.8rem", color: "#ef4444", marginBottom: 8 }}>{error}</p>}
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        width: "100%",
        background: isGarage ? "#ffffff" : "#111110",
        color: isGarage ? "#111110" : "#ffffff",
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
