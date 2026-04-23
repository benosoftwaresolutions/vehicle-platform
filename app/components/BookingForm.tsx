"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

type SlotsResponse =
  | { open: false; reason: "no_availability" | "closed" }
  | { open: true; slots: string[] }

export default function BookingForm({ garageId, services }: { garageId: string; services: string[] }) {
  const router = useRouter()
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [registration, setRegistration] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)

  useEffect(() => {
    if (!date) { setSlotsData(null); setTime(""); return }
    setSlotsLoading(true)
    setTime("")
    fetch(`/api/garages/${garageId}/slots?date=${date}`)
      .then(r => r.json())
      .then((data: SlotsResponse) => setSlotsData(data))
      .catch(() => setSlotsData(null))
      .finally(() => setSlotsLoading(false))
  }, [date, garageId])

  const handleBooking = async () => {
    if (!service || !date || !time || !registration || services.length === 0) return
    setLoading(true)
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garageId, service, date, time, registration }),
    })
    if (res.ok) { setSuccess(true); router.refresh() }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ background: "#f4f3ef", borderRadius: 12, padding: 16, color: "#111110", fontWeight: 600, fontSize: "0.9rem" }}>
        Booking confirmed — view it in My Bookings.
      </div>
    )
  }

  const today = new Date().toISOString().split("T")[0]
  const canBook = !loading && !!service && !!date && !!time && !!registration && services.length > 0

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: 18, color: "#111110", marginBottom: 20, letterSpacing: "-0.02em" }}>
        Book an appointment
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <div>
          <label style={lbl}>Registration</label>
          <input
            type="text"
            placeholder="e.g. AB12 CDE"
            value={registration}
            onChange={e => setRegistration(e.target.value.toUpperCase())}
            style={inp}
          />
        </div>

        <div>
          <label style={lbl}>Service</label>
          {services.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#6b6a66", padding: "10px 14px", background: "#f4f3ef", borderRadius: 10 }}>
              No services configured yet.
            </p>
          ) : (
            <select value={service} onChange={e => setService(e.target.value)} style={inp}>
              <option value="">Select a service</option>
              {services.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        <div>
          <label style={lbl}>Date</label>
          <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} style={inp} />
        </div>

        {date && (
          <div>
            <label style={lbl}>Available times</label>
            {slotsLoading ? (
              <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>Checking availability…</p>
            ) : !slotsData ? (
              <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>Could not load availability.</p>
            ) : !slotsData.open ? (
              <div style={{ background: "#f4f3ef", borderRadius: 10, padding: "10px 14px", color: "#444441", fontSize: "0.875rem" }}>
                {slotsData.reason === "no_availability"
                  ? "This garage hasn't set up their availability yet."
                  : "This garage is closed on that day."}
              </div>
            ) : slotsData.slots.length === 0 ? (
              <div style={{ background: "#f4f3ef", borderRadius: 10, padding: "10px 14px", color: "#444441", fontSize: "0.875rem" }}>
                Fully booked on this day.
              </div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {slotsData.slots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTime(slot)}
                    style={{
                      padding: "7px 14px", borderRadius: 100,
                      border: time === slot ? "none" : "0.5px solid rgba(0,0,0,0.15)",
                      background: time === slot ? "#111110" : "#ffffff",
                      color: time === slot ? "#ffffff" : "#111110",
                      fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
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
          disabled={!canBook}
          style={{
            background: canBook ? "#111110" : "#eceae4",
            color: canBook ? "#ffffff" : "#6b6a66",
            padding: "12px", borderRadius: 100,
            fontWeight: 600, fontSize: "0.9rem",
            cursor: canBook ? "pointer" : "not-allowed",
            border: "none", marginTop: 4,
          }}
        >
          {loading ? "Booking…" : "Confirm Booking"}
        </button>
      </div>
    </div>
  )
}

const lbl: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "#444441", display: "block", marginBottom: 5 }
const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "10px 16px", fontSize: "0.9rem", background: "#ffffff", color: "#111110", outline: "none" }
