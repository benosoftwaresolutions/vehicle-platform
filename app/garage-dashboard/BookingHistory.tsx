"use client"

import { useState } from "react"

type HistoryBooking = {
  id: string
  service: string
  date: string
  status: string
  jobValue: number | null
}

export default function BookingHistory({ garageId, registration }: { garageId: string; registration: string }) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<HistoryBooking[] | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    if (history !== null) { setOpen(o => !o); return }
    setLoading(true)
    setOpen(true)
    try {
      const res = await fetch(`/api/garages/${garageId}/history?registration=${encodeURIComponent(registration)}`)
      const data = await res.json()
      setHistory(data)
    } catch {
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: "10px" }}>
      <button
        type="button"
        onClick={load}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, color: "#6b6a66", padding: 0 }}
      >
        {open ? "▾" : "▸"} Vehicle history
      </button>
      {open && (
        <div style={{ marginTop: "8px", paddingLeft: "2px" }}>
          {loading ? (
            <p style={{ fontSize: "0.78rem", color: "#6b6a66" }}>Loading…</p>
          ) : !history || history.length === 0 ? (
            <p style={{ fontSize: "0.78rem", color: "#6b6a66" }}>No previous visits.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {history.map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#eceae4", borderRadius: 8, padding: "7px 12px", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111110" }}>{b.service}</span>
                    <span style={{ fontSize: "0.78rem", color: "#6b6a66", marginLeft: 8 }}>
                      {new Date(b.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {b.jobValue && <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#111110" }}>£{b.jobValue.toFixed(2)}</span>}
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: b.status === "completed" ? "#111110" : "#6b6a66", background: "#ffffff", padding: "2px 8px", borderRadius: 100 }}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
