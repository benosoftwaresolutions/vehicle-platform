"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserRole } from "../actions"

export default function ApproveButton({ userId, garageName }: { userId: string; garageName: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (confirming) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 140 }}>
        <p style={{ fontSize: "0.78rem", color: "#444441", fontWeight: 600, textAlign: "center" }}>Approve {garageName}?</p>
        <button
          onClick={async () => {
            setLoading(true)
            await updateUserRole(userId, "garage_owner")
            router.refresh()
          }}
          disabled={loading}
          style={{ background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "9px 18px", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
        >
          {loading ? "Approving…" : "Yes, approve"}
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
      style={{ background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "9px 18px", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" }}
    >
      Approve garage
    </button>
  )
}
