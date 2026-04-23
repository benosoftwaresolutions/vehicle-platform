"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { respondToAlternative } from "@/app/bookings/actions"

export default function AlternativeResponseButtons({
  bookingId,
  suggestedDate,
  suggestedTime,
}: {
  bookingId: string
  suggestedDate: Date
  suggestedTime: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null)
  const [error, setError] = useState("")

  const handle = async (response: "accept" | "decline") => {
    setLoading(response)
    setError("")
    try {
      await respondToAlternative(bookingId, response)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const formattedDate = new Date(suggestedDate).toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  })

  return (
    <div style={{
      marginTop: "12px",
      background: "#f4f3ef",
      border: "0.5px solid rgba(0,0,0,0.10)",
      borderRadius: 12,
      padding: "14px 16px",
    }}>
      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111110", marginBottom: "10px" }}>
        Alternative offered: {formattedDate} at {suggestedTime}
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() => handle("accept")}
          disabled={loading !== null}
          style={{
            background: loading !== null ? "#eceae4" : "#111110",
            color: loading !== null ? "#6b6a66" : "#ffffff",
            padding: "8px 18px", borderRadius: 100,
            fontWeight: 600, fontSize: "0.875rem", border: "none",
            cursor: loading !== null ? "not-allowed" : "pointer",
          }}
        >
          {loading === "accept" ? "Accepting..." : "Accept alternative"}
        </button>
        <button
          onClick={() => handle("decline")}
          disabled={loading !== null}
          style={{
            background: "transparent",
            color: loading !== null ? "#6b6a66" : "#111110",
            padding: "8px 18px", borderRadius: 100,
            fontWeight: 600, fontSize: "0.875rem",
            border: "0.5px solid rgba(0,0,0,0.2)",
            cursor: loading !== null ? "not-allowed" : "pointer",
          }}
        >
          {loading === "decline" ? "Declining..." : "Decline"}
        </button>
      </div>
      {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "8px" }}>{error}</p>}
    </div>
  )
}
