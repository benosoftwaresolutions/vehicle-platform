"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateUserRole } from "../../actions"

export default function ApproveButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <button
      onClick={async () => {
        setLoading(true)
        await updateUserRole(userId, "garage_owner")
        router.refresh()
      }}
      disabled={loading}
      style={{ background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "5px 14px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
    >
      {loading ? "…" : "Approve"}
    </button>
  )
}
