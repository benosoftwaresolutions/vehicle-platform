"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createWalkInBooking } from "./actions"

type SlotsResponse =
  | { open: false; reason: "no_availability" | "closed" }
  | { open: true; slots: string[] }

export default function WalkInBookingButton({ garageId, services }: { garageId: string; services: string[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Form state
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [registration, setRegistration] = useState("")
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  // Slots state
  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)

  // Submission state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch slots when date changes
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

  const resetForm = () => {
    setCustomerName(""); setCustomerPhone(""); setRegistration("")
    setService(""); setDate(""); setTime("")
    setSlotsData(null); setError("")
  }

  const handleClose = () => { setOpen(false); resetForm() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await createWalkInBooking({ garageId, customerName, customerPhone, registration, service, date, time })
      handleClose()
      router.refresh()
    } catch (err) {
      console.error("[WalkInBookingButton] Submission error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]
  const canSubmit = customerName && customerPhone && registration && service && date && time && services.length > 0

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: "#f59e0b", color: "#0f172a", padding: "10px 20px",
          borderRadius: "10px", fontWeight: 700, fontSize: "0.875rem",
          border: "none", cursor: "pointer",
        }}
      >
        + Walk-in
      </button>

      {open && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "white", borderRadius: "16px", padding: "32px",
              width: "100%", maxWidth: "520px", maxHeight: "90vh",
              overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.25rem" }}>Create Walk-in Booking</h2>
              <button
                onClick={handleClose}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.25rem", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Customer details */}
              <div style={{ background: "#f8f9fb", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer</p>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    type="text" value={customerName} required
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. John Smith"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    type="tel" value={customerPhone} required
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 07700 900123"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Vehicle & service */}
              <div style={{ background: "#f8f9fb", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vehicle & Service</p>
                <div>
                  <label style={labelStyle}>Registration</label>
                  <input
                    type="text" value={registration} required
                    onChange={e => setRegistration(e.target.value.toUpperCase())}
                    placeholder="e.g. AB12 CDE"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Service</label>
                  {services.length === 0 ? (
                    <div style={{ background: "#f8f9fb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 13px", color: "#64748b", fontSize: "0.875rem" }}>
                      No services configured. Add services in Garage Settings first.
                    </div>
                  ) : (
                    <select value={service} required onChange={e => setService(e.target.value)} style={inputStyle}>
                      <option value="">Select a service</option>
                      {services.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* Date & time */}
              <div style={{ background: "#f8f9fb", borderRadius: "10px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ fontWeight: 700, fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Date & Time</p>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date" value={date} min={today} required
                    onChange={e => setDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {date && (
                  <div>
                    <label style={labelStyle}>Available Slots</label>
                    {slotsLoading ? (
                      <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Checking availability...</p>
                    ) : !slotsData ? (
                      <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Could not load slots.</p>
                    ) : !slotsData.open ? (
                      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px", color: "#991b1b", fontSize: "0.875rem" }}>
                        {slotsData.reason === "no_availability"
                          ? "No availability set up for this garage."
                          : "Garage is closed on this day."}
                      </div>
                    ) : slotsData.slots.length === 0 ? (
                      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px", color: "#991b1b", fontSize: "0.875rem" }}>
                        Fully booked on this day.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {slotsData.slots.map(slot => (
                          <button
                            key={slot} type="button"
                            onClick={() => setTime(slot)}
                            style={{
                              padding: "7px 14px", borderRadius: "8px",
                              border: time === slot ? "2px solid #0f172a" : "1px solid #e5e7eb",
                              background: time === slot ? "#0f172a" : "white",
                              color: time === slot ? "white" : "#0f172a",
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
              </div>

              {error && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem", fontWeight: 600 }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  style={{
                    flex: 1, background: loading || !canSubmit ? "#94a3b8" : "#0f172a",
                    color: "white", padding: "12px", borderRadius: "10px",
                    fontWeight: 700, fontSize: "0.95rem", border: "none",
                    cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Saving..." : "Create Walk-in Booking"}
                </button>
                <button
                  type="button" onClick={handleClose}
                  style={{
                    background: "white", color: "#64748b", padding: "12px 20px",
                    borderRadius: "10px", fontWeight: 600, fontSize: "0.95rem",
                    border: "1px solid #e5e7eb", cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px",
  padding: "9px 13px", fontSize: "0.9rem", background: "white",
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.8rem", fontWeight: 600, color: "#374151",
  display: "block", marginBottom: "5px",
}
