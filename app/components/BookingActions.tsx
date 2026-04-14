"use client"

import { useState } from "react"
import { updateBookingStatus } from "@/app/garage-dashboard/actions"

type BookingActionsProps = {
  bookingId: string
  currentStatus: string
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
]

export default function BookingActions({ bookingId, currentStatus }: BookingActionsProps) {
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

  if (currentStatus === "confirmed") {
    return (
      <span style={{background: "#dcfce7", color: "#166534", padding: "6px 14px", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600}}>
        ✅ Confirmed
      </span>
    )
  }

  if (currentStatus === "declined") {
    return (
      <span style={{background: "#fee2e2", color: "#991b1b", padding: "6px 14px", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600}}>
        ❌ Declined
      </span>
    )
  }

  return (
    <div>
      {!showDeclineForm ? (
        <div style={{display: "flex", gap: "8px", flexDirection: "column"}}>
          <button
            onClick={handleAccept}
            disabled={loading}
            style={{background: "#0f172a", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer"}}
          >
            ✅ Accept
          </button>
          <button
            onClick={() => setShowDeclineForm(true)}
            disabled={loading}
            style={{background: "white", color: "#991b1b", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem", border: "1px solid #fca5a5", cursor: "pointer"}}
          >
            ❌ Decline
          </button>
        </div>
      ) : (
        <div style={{background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", padding: "16px", minWidth: "240px"}}>
          <p style={{fontWeight: 700, fontSize: "0.875rem", marginBottom: "12px"}}>Decline Booking</p>
          <div style={{marginBottom: "10px"}}>
            <label style={{fontSize: "0.75rem", fontWeight: 600, display: "block", marginBottom: "4px"}}>Reason (optional)</label>
            <textarea
              value={garageNote}
              onChange={e => setGarageNote(e.target.value)}
              placeholder="e.g. Fully booked on that day"
              rows={2}
              style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px", fontSize: "0.875rem"}}
            />
          </div>
          <p style={{fontSize: "0.75rem", fontWeight: 600, marginBottom: "8px", color: "#92400e"}}>Suggest alternative (optional)</p>
          <div style={{marginBottom: "10px"}}>
            <label style={{fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px"}}>Date</label>
            <input
              type="date"
              value={suggestedDate}
              onChange={e => setSuggestedDate(e.target.value)}
              style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px"}}
            />
          </div>
          <div style={{marginBottom: "12px"}}>
            <label style={{fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px"}}>Time</label>
            <select
              value={suggestedTime}
              onChange={e => setSuggestedTime(e.target.value)}
              style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px"}}
            >
              <option value="">Select time</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div style={{display: "flex", gap: "8px"}}>
            <button
              onClick={handleDecline}
              disabled={loading}
              style={{background: "#dc2626", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer", flex: 1}}
            >
              {loading ? "Saving..." : "Confirm Decline"}
            </button>
            <button
              onClick={() => setShowDeclineForm(false)}
              style={{background: "white", color: "#64748b", padding: "8px 16px", borderRadius: "8px", fontWeight: 600, fontSize: "0.875rem", border: "1px solid #e5e7eb", cursor: "pointer"}}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}