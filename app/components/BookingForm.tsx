"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type BookingFormProps = {
  garageId: string
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
]

export default function BookingForm({ garageId }: BookingFormProps) {
  const router = useRouter()
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [registration, setRegistration] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleBooking = async () => {
    if (!service || !date || !time || !registration) return

    setLoading(true)

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garageId, service, date, time, registration })
    })

    if (res.ok) {
      setSuccess(true)
      router.refresh()
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div style={{background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "16px", color: "#166534", fontWeight: 700}}>
        ✅ Booking confirmed! View it in My Bookings.
      </div>
    )
  }

  return (
    <div>
      <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "20px"}}>Book an Appointment</h2>
      <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
        <div>
          <label style={{fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "4px", display: "block"}}>Vehicle Registration</label>
          <input
            type="text"
            placeholder="e.g. AB12 CDE"
            value={registration}
            onChange={(e) => setRegistration(e.target.value.toUpperCase())}
            style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px", fontSize: "0.95rem"}}
          />
        </div>
        <div>
          <label style={{fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "4px", display: "block"}}>Service</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value)}
            style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px", fontSize: "0.95rem"}}
          >
            <option value="">Select a service</option>
            <option value="MOT">MOT</option>
            <option value="Full Service">Full Service</option>
            <option value="Oil Change">Oil Change</option>
            <option value="Tyres">Tyres</option>
            <option value="Brakes">Brakes</option>
          </select>
        </div>
        <div>
          <label style={{fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "4px", display: "block"}}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px", fontSize: "0.95rem"}}
          />
        </div>
        <div>
          <label style={{fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "4px", display: "block"}}>Time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px", fontSize: "0.95rem"}}
          >
            <option value="">Select a time</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleBooking}
          disabled={loading || !service || !date || !time || !registration}
          style={{background: loading ? "#94a3b8" : "#0f172a", color: "white", padding: "12px", borderRadius: "10px", fontWeight: 700, fontSize: "1rem", cursor: "pointer", border: "none", marginTop: "8px"}}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  )
}