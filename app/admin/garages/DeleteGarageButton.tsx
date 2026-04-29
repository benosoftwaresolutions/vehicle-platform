"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteGarage } from "../actions"

export default function DeleteGarageButton({ garageId, garageName }: { garageId: string; garageName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {error
          ? <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600 }}>{error}</span>
          : <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 600 }}>Sure?</span>
        }
        <button
          onClick={async () => {
            setLoading(true)
            setError(null)
            try {
              await deleteGarage(garageId)
              router.refresh()
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed")
              setLoading(false)
            }
          }}
          disabled={loading}
          style={{ background: "#111110", color: "white", border: "none", borderRadius: 100, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
        >
          {loading ? "…" : "Yes"}
        </button>
        <button
          onClick={() => { setConfirming(false); setError(null) }}
          style={{ background: "transparent", color: "#444441", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
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
      style={{ background: "transparent", color: "#dc2626", border: "0.5px solid rgba(220,38,38,0.3)", borderRadius: 100, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
    >
      Delete
    </button>
  )
}
