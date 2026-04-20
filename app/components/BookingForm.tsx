"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type SlotsResponse =
  | { open: false; reason: "no_availability" | "closed" }
  | { open: true; slots: string[] }

type BookingFormProps = {
  garageId: string
  services: string[]
}

export default function BookingForm({ garageId, services }: BookingFormProps) {
  const router = useRouter()
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [registration, setRegistration] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)

  // Fetch available slots whenever the date changes
  useEffect(() => {
    if (!date) {
      setSlotsData(null)
      setTime("")
      return
    }
    setSlotsLoading(true)
    setTime("")
    fetch(`/api/garages/${garageId}/slots?date=${date}`)
      .then((r) => r.json())
      .then((data: SlotsResponse) => setSlotsData(data))
      .catch(() => setSlotsData(null))
      .finally(() => setSlotsLoading(false))
  }, [date, garageId])

  const handleBooking = async () => {
    if (!service || !date || !time || !registration) return
    setLoading(true)
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garageId, service, date, time, registration }),
    })
    if (res.ok) {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "16px", color: "#166534", fontWeight: 700 }}>
        ✅ Booking confirmed! View it in My Bookings.
      </div>
    )
  }

  // Today's date as YYYY-MM-DD for the min attribute
  const today = new Date().toISOString().split("T")[0]

  return (
    <div>
      <h2 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "20px" }}>Book an Appointment</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

        <div>
          <label style={labelStyle}>Vehicle Registration</label>
          <input
            type="text"
            placeholder="e.g. AB12 CDE"
            value={registration}
            onChange={(e) => setRegistration(e.target.value.toUpperCase())}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Service</label>
          {services.length === 0 ? (
            <div style={{ background: "#f8f9fb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px", color: "#64748b", fontSize: "0.875rem" }}>
              This garage hasn&apos;t configured their services yet.
            </div>
          ) : (
            <select value={service} onChange={(e) => setService(e.target.value)} style={inputStyle}>
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Time slot picker */}
        {date && (
          <div>
            <label style={labelStyle}>Available Times</label>
            {slotsLoading ? (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Checking availability...</p>
            ) : !slotsData ? (
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Could not load availability.</p>
            ) : !slotsData.open ? (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", color: "#991b1b", fontSize: "0.875rem" }}>
                {slotsData.reason === "no_availability"
                  ? "This garage hasn't set up their availability yet."
                  : "This garage is not open on that day."}
              </div>
            ) : slotsData.slots.length === 0 ? (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px", color: "#991b1b", fontSize: "0.875rem" }}>
                No slots available — this day is fully booked.
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {slotsData.slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: time === slot ? "2px solid #0f172a" : "1px solid #e5e7eb",
                      background: time === slot ? "#0f172a" : "white",
                      color: time === slot ? "white" : "#0f172a",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleBooking}
          disabled={loading || !service || !date || !time || !registration || services.length === 0}
          style={{
            background: loading || !service || !date || !time || !registration || services.length === 0 ? "#94a3b8" : "#0f172a",
            color: "white",
            padding: "12px",
            borderRadius: "10px",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: loading || !service || !date || !time || !registration ? "not-allowed" : "pointer",
            border: "none",
            marginTop: "8px",
          }}
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "0.95rem",
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "4px",
  display: "block",
}
