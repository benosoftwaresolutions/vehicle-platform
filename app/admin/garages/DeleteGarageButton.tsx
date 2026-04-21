"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteGarage } from "../actions"

export default function DeleteGarageButton({ garageId, garageName }: { garageId: string; garageName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600 }}>Sure?</span>
        <button
          onClick={async () => {
            setLoading(true)
            await deleteGarage(garageId)
            router.refresh()
          }}
          disabled={loading}
          style={{ background: "#dc2626", color: "white", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{ background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title={`Delete ${garageName}`}
      style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
    >
      Delete
    </button>
  )
}
