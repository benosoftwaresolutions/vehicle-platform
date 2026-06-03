"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { declinePendingGarage } from "../actions"

export default function DeclineButton({ userId, garageId, garageName }: { userId: string; garageId: string; garageName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 140 }}>
        <p style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: 600, textAlign: "center" }}>Decline {garageName}?</p>
        <p style={{ fontSize: "0.72rem", color: "#6b6a66", textAlign: "center" }}>This removes the garage and resets the owner&apos;s account.</p>
        <button
          onClick={async () => {
            setLoading(true)
            await declinePendingGarage(userId, garageId)
            router.refresh()
          }}
          disabled={loading}
          style={{ background: "#dc2626", color: "#ffffff", border: "none", borderRadius: 100, padding: "9px 18px", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
        >
          {loading ? "Declining…" : "Yes, decline"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{ background: "transparent", color: "#444441", border: "0.5px solid rgba(0,0,0,0.2)", borderRadius: 100, padding: "9px 18px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{ background: "transparent", color: "#dc2626", border: "0.5px solid #dc2626", borderRadius: 100, padding: "9px 18px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" }}
    >
      Decline
    </button>
  )
}
