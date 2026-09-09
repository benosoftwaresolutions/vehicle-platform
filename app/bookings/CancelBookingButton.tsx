"use client"

import { useState } from "react"
import { cancelBooking } from "./actions"
import { useSettledRefresh } from "@/app/components/useSettledRefresh"
import ActionDone from "@/app/components/ActionDone"

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const { done, finish } = useSettledRefresh()

  if (done) {
    return <div style={{ marginTop: 12 }}><ActionDone label={done} sub="Updating your bookings…" /></div>
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        style={{
          background: "transparent",
          border: "0.5px solid rgba(0,0,0,0.15)",
          color: "#6b6a66",
          padding: "6px 16px",
          borderRadius: 100,
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
          marginTop: "12px",
        }}
      >
        Cancel booking
      </button>
    )
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "12px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "0.82rem", color: "#444441" }}>Are you sure?</span>
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true)
          await cancelBooking(bookingId)
          finish("Booking cancelled")
        }}
        style={{
          background: "#111110",
          color: "#ffffff",
          border: "none",
          padding: "6px 16px",
          borderRadius: 100,
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Cancelling…" : "Yes, cancel"}
      </button>
      <button
        disabled={loading}
        onClick={() => setConfirming(false)}
        style={{
          background: "transparent",
          border: "0.5px solid rgba(0,0,0,0.15)",
          color: "#6b6a66",
          padding: "6px 16px",
          borderRadius: 100,
          fontSize: "0.8rem",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Keep
      </button>
    </div>
  )
}
