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
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div style={{ marginTop: "12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "14px" }}>
      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#1e40af", marginBottom: "10px" }}>
        Alternative offered: {formattedDate} at {suggestedTime}
      </p>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() => handle("accept")}
          disabled={loading !== null}
          style={{
            background: loading === "accept" ? "#94a3b8" : "#16a34a",
            color: "white", padding: "8px 16px", borderRadius: "8px",
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
            background: loading === "decline" ? "#94a3b8" : "white",
            color: loading === "decline" ? "white" : "#dc2626",
            padding: "8px 16px", borderRadius: "8px",
            fontWeight: 600, fontSize: "0.875rem",
            border: "1px solid #fca5a5",
            cursor: loading !== null ? "not-allowed" : "pointer",
          }}
        >
          {loading === "decline" ? "Declining..." : "Decline alternative"}
        </button>
      </div>
      {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "8px", fontWeight: 600 }}>{error}</p>}
    </div>
  )
}
