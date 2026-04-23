"use client"

import { useState } from "react"
import { updateBookingStatus } from "@/app/garage-dashboard/actions"

const timeSlots = [
  "08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30",
  "14:00","14:30","15:00","15:30","16:00","16:30",
]

export default function BookingActions({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const [showDeclineForm, setShowDeclineForm] = useState(false)
  const [garageNote, setGarageNote] = useState("")
  const [suggestedDate, setSuggestedDate] = useState("")
  const [suggestedTime, setSuggestedTime] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAccept = async () => {
    setLoading(true)
    await updateBookingStatus(bookingId, "confirmed")
    setLoading(false)
  }

  const handleDecline = async () => {
    setLoading(true)
    await updateBookingStatus(bookingId, "declined", garageNote, suggestedDate, suggestedTime)
    setLoading(false)
    setShowDeclineForm(false)
  }

  if (currentStatus === "completed") {
    return (
      <span style={{ background: "#eceae4", color: "#111110", padding: "6px 14px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 600 }}>
        Completed
      </span>
    )
  }

  if (currentStatus === "confirmed") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
        <span style={{ background: "#111110", color: "#ffffff", padding: "6px 14px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 600 }}>
          Confirmed
        </span>
        <button
          onClick={async () => {
            setLoading(true)
            await updateBookingStatus(bookingId, "completed")
            setLoading(false)
          }}
          disabled={loading}
          style={{ background: "transparent", color: "#444441", padding: "5px 14px", borderRadius: 100, fontSize: "0.78rem", fontWeight: 600, border: "0.5px solid rgba(0,0,0,0.2)", cursor: "pointer", opacity: loading ? 0.5 : 1, whiteSpace: "nowrap" }}
        >
          Mark completed
        </button>
      </div>
    )
  }

  if (currentStatus === "declined") {
    return (
      <span style={{ background: "#eceae4", color: "#111110", padding: "6px 14px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 600, textDecoration: "line-through" }}>
        Declined
      </span>
    )
  }

  if (currentStatus === "declined_by_customer") {
    return (
      <span style={{ background: "#f4f3ef", color: "#6b6a66", padding: "6px 14px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 600 }}>
        Cancelled
      </span>
    )
  }

  return (
    <div>
      {!showDeclineForm ? (
        <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
          <button
            onClick={handleAccept}
            disabled={loading}
            style={{ background: "#111110", color: "#ffffff", padding: "8px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer", opacity: loading ? 0.5 : 1 }}
          >
            Accept
          </button>
          <button
            onClick={() => setShowDeclineForm(true)}
            disabled={loading}
            style={{ background: "transparent", color: "#111110", padding: "8px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "0.5px solid rgba(0,0,0,0.2)", cursor: "pointer" }}
          >
            Decline
          </button>
        </div>
      ) : (
        <div style={{ background: "#f4f3ef", border: "0.5px solid rgba(0,0,0,0.10)", borderRadius: 12, padding: "16px", minWidth: 240 }}>
          <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "#111110", marginBottom: "12px" }}>Decline Booking</p>
          <div style={{ marginBottom: "10px" }}>
            <label style={lbl}>Reason (optional)</label>
            <textarea
              value={garageNote}
              onChange={e => setGarageNote(e.target.value)}
              placeholder="e.g. Fully booked on that day"
              rows={2}
              style={inp}
            />
          </div>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, marginBottom: "8px", color: "#444441" }}>Suggest alternative (optional)</p>
          <div style={{ marginBottom: "10px" }}>
            <label style={lbl}>Date</label>
            <input type="date" value={suggestedDate} onChange={e => setSuggestedDate(e.target.value)} style={inp} />
          </div>
          <div style={{ marginBottom: "12px" }}>
            <label style={lbl}>Time</label>
            <select value={suggestedTime} onChange={e => setSuggestedTime(e.target.value)} style={inp}>
              <option value="">Select time</option>
              {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleDecline}
              disabled={loading}
              style={{ background: "#111110", color: "#ffffff", padding: "8px 16px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer", flex: 1 }}
            >
              {loading ? "Saving..." : "Confirm Decline"}
            </button>
            <button
              onClick={() => setShowDeclineForm(false)}
              style={{ background: "transparent", color: "#444441", padding: "8px 16px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "0.5px solid rgba(0,0,0,0.15)", cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const lbl: React.CSSProperties = { fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "4px", color: "#444441" }
const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "8px 12px", fontSize: "0.875rem", background: "#ffffff", color: "#111110" }
