"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { approveGarage } from "../actions"

export default function ApproveGarageButton({ garageId }: { garageId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <button
      onClick={async () => {
        setLoading(true)
        await approveGarage(garageId)
        router.refresh()
      }}
      disabled={loading}
      style={{ background: "#16a34a", color: "white", border: "none", borderRadius: 100, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
    >
      {loading ? "…" : "Approve"}
    </button>
  )
}
