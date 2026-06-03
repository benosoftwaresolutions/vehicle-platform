"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createWalkInBooking } from "./actions"

type SlotsResponse =
  | { open: false; reason: "no_availability" | "closed" }
  | { open: true; slots: string[] }

type PreviousCustomer = {
  customerName: string | null
  customerPhone: string | null
  customerEmail: string | null
  registration: string
  vehicleMake: string | null
  vehicleModel: string | null
}

type InitialData = {
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  registration?: string
  service?: string
}

export default function WalkInBookingButton({ garageId, services, initialData, label }: {
  garageId: string
  services: string[]
  initialData?: InitialData
  label?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const [customerName, setCustomerName] = useState(initialData?.customerName ?? "")
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone ?? "")
  const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail ?? "")
  const [registration, setRegistration] = useState(initialData?.registration ?? "")
  const [service, setService] = useState(initialData?.service ?? "")
  const [customService, setCustomService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Customer search
  const [search, setSearch] = useState("")
  const [suggestions, setSuggestions] = useState<PreviousCustomer[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (search.length < 2) { setSuggestions([]); return }
    const timer = setTimeout(() => {
      fetch(`/api/garages/${garageId}/customers?q=${encodeURIComponent(search)}`)
        .then(r => r.json())
        .then(data => { setSuggestions(data); setShowSuggestions(true) })
        .catch(() => {})
    }, 250)
    return () => clearTimeout(timer)
  }, [search, garageId])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selectCustomer = (c: PreviousCustomer) => {
    setCustomerName(c.customerName ?? "")
    setCustomerPhone(c.customerPhone ?? "")
    setCustomerEmail(c.customerEmail ?? "")
    setRegistration(c.registration)
    setSearch("")
    setSuggestions([])
    setShowSuggestions(false)
  }

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
    setCustomerName(initialData?.customerName ?? "")
    setCustomerPhone(initialData?.customerPhone ?? "")
    setCustomerEmail(initialData?.customerEmail ?? "")
    setRegistration(initialData?.registration ?? "")
    setService(initialData?.service ?? "")
    setCustomService(""); setDate(""); setTime("")
    setSlotsData(null); setError(""); setSearch(""); setSuggestions([])
  }

  const handleClose = () => { setOpen(false); resetForm() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const resolvedService = service === "__other__" ? customService.trim() : service
      await createWalkInBooking({ garageId, customerName, customerPhone, customerEmail, registration, service: resolvedService, date, time })
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
  const hasContact = customerPhone.trim() || customerEmail.trim()
  const serviceReady = service === "__other__" ? customService.trim().length > 0 : !!service
  const canSubmit = customerName && hasContact && registration && serviceReady && date && time && services.length > 0

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#111110"; (e.currentTarget as HTMLButtonElement).style.color = "#ffffff" }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f4f3ef"; (e.currentTarget as HTMLButtonElement).style.color = "#111110" }}
        style={{ background: "#f4f3ef", color: "#111110", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
      >
        {label ?? "+ Walk-in"}
      </button>

      {open && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#ffffff", borderRadius: 16, padding: "32px",
              width: "100%", maxWidth: "520px", maxHeight: "90vh",
              overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.2rem", letterSpacing: "-0.02em", color: "#111110" }}>
                Create Walk-in Booking
              </h2>
              <button
                onClick={handleClose}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem", color: "#6b6a66", lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Previous customer search */}
              <div ref={searchRef} style={{ position: "relative" }}>
                <label style={lbl}>Search previous customer</label>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Name, phone, or registration…"
                  style={inp}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                    background: "#ffffff", borderRadius: 10, marginTop: 4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "0.5px solid rgba(0,0,0,0.1)",
                    overflow: "hidden",
                  }}>
                    {suggestions.map((c, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        style={{
                          width: "100%", textAlign: "left", background: "none", border: "none",
                          padding: "10px 14px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2,
                          borderBottom: i < suggestions.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f4f3ef")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111110" }}>{c.customerName}</span>
                        <span style={{ fontSize: "0.78rem", color: "#6b6a66" }}>
                          {c.registration}{c.vehicleMake ? ` · ${c.vehicleMake} ${c.vehicleModel ?? ""}`.trimEnd() : ""}{c.customerPhone ? ` · ${c.customerPhone}` : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer details */}
              <div style={section}>
                <p style={sectionLabel}>Customer</p>
                <div>
                  <label style={lbl}>Full Name</label>
                  <input type="text" value={customerName} required onChange={e => setCustomerName(e.target.value)} placeholder="e.g. John Smith" style={inp} />
                </div>
                <div>
                  <label style={lbl}>
                    Phone Number
                    <span style={{ fontWeight: 400, color: "#9b9a96", marginLeft: 4 }}>(or email below)</span>
                  </label>
                  <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="e.g. 07700 900123" style={inp} />
                </div>
                <div>
                  <label style={lbl}>
                    Email Address
                    <span style={{ fontWeight: 400, color: "#9b9a96", marginLeft: 4 }}>(or phone above)</span>
                  </label>
                  <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="e.g. john@example.com" style={inp} />
                </div>
                {customerName && !hasContact && (
                  <p style={{ fontSize: "0.8rem", color: "#dc2626", margin: 0 }}>A phone number or email is required.</p>
                )}
              </div>

              {/* Vehicle & service */}
              <div style={section}>
                <p style={sectionLabel}>Vehicle & Service</p>
                <div>
                  <label style={lbl}>Registration</label>
                  <input type="text" value={registration} required onChange={e => setRegistration(e.target.value.toUpperCase())} placeholder="e.g. AB12 CDE" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Service</label>
                  {services.length === 0 ? (
                    <div style={{ background: "#f4f3ef", borderRadius: 8, padding: "10px 13px", color: "#6b6a66", fontSize: "0.875rem" }}>
                      No services configured. Add services in Settings first.
                    </div>
                  ) : (
                    <>
                      <select value={service} required onChange={e => setService(e.target.value)} style={inp}>
                        <option value="">Select a service</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                        <option value="__other__">Not sure — describe the issue</option>
                      </select>
                      {service === "__other__" && (
                        <textarea
                          placeholder="Describe what's wrong or what needs checking…"
                          value={customService}
                          onChange={e => setCustomService(e.target.value)}
                          rows={3}
                          style={{ ...inp, borderRadius: 8, resize: "vertical", marginTop: 8, padding: "9px 13px" }}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Date & time */}
              <div style={section}>
                <p style={sectionLabel}>Date & Time</p>
                <div>
                  <label style={lbl}>Date</label>
                  <input type="date" value={date} min={today} required onChange={e => setDate(e.target.value)} style={inp} />
                </div>

                {date && (
                  <div>
                    <label style={lbl}>Available Slots</label>
                    {slotsLoading ? (
                      <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>Checking availability…</p>
                    ) : !slotsData ? (
                      <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>Could not load slots.</p>
                    ) : !slotsData.open ? (
                      <div style={{ background: "#f4f3ef", borderRadius: 8, padding: "10px 14px", color: "#444441", fontSize: "0.875rem" }}>
                        {slotsData.reason === "no_availability"
                          ? "No availability set up for this garage."
                          : "Garage is closed on this day."}
                      </div>
                    ) : slotsData.slots.length === 0 ? (
                      <div style={{ background: "#f4f3ef", borderRadius: 8, padding: "10px 14px", color: "#444441", fontSize: "0.875rem" }}>
                        Fully booked on this day.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {slotsData.slots.map(slot => (
                          <button
                            key={slot} type="button"
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
              </div>

              {error && (
                <p style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  style={{
                    flex: 1,
                    background: loading || !canSubmit ? "#eceae4" : "#111110",
                    color: loading || !canSubmit ? "#6b6a66" : "#ffffff",
                    padding: "12px", borderRadius: 100,
                    fontWeight: 600, fontSize: "0.95rem", border: "none",
                    cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Saving…" : "Create Walk-in Booking"}
                </button>
                <button
                  type="button" onClick={handleClose}
                  style={{
                    background: "transparent", color: "#444441", padding: "12px 20px",
                    borderRadius: 100, fontWeight: 600, fontSize: "0.95rem",
                    border: "0.5px solid rgba(0,0,0,0.15)", cursor: "pointer",
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

const section: React.CSSProperties = { background: "#f4f3ef", borderRadius: 12, padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }
const sectionLabel: React.CSSProperties = { fontWeight: 700, fontSize: "0.75rem", color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.07em" }
const lbl: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "#444441", display: "block", marginBottom: "5px" }
const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "9px 13px", fontSize: "0.9rem", background: "#ffffff", color: "#111110" }
