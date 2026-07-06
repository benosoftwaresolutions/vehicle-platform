"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, SignUpButton, SignInButton } from "@clerk/nextjs"

type SlotsResponse =
  | { open: false; reason: "no_availability" | "closed" }
  | { open: true; slots: string[] }

type Vehicle = { id: string; registration: string; make: string; model: string; year: string }
type PriceRange = { min: number | null; max: number | null }

export default function BookingForm({ garageId, services, servicePricing = {} }: { garageId: string; services: string[]; servicePricing?: Record<string, PriceRange> }) {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [customService, setCustomService] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) { setVehicles([]); return }
    fetch("/api/vehicles")
      .then(r => r.ok ? r.json() : [])
      .then((data: Vehicle[]) => setVehicles(data))
      .catch(() => setVehicles([]))
  }, [isLoaded, isSignedIn])

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
    const resolvedService = service === "__other__" ? customService.trim() : service
    if (!resolvedService || !date || !time || !selectedVehicle || services.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          garageId,
          service: resolvedService,
          date,
          time,
          registration: selectedVehicle.registration,
          vehicleMake: selectedVehicle.make,
          vehicleModel: selectedVehicle.model,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? "Something went wrong — please try again.")
      }
    } catch {
      setError("Could not connect — please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ background: "#f4f3ef", borderRadius: 12, padding: 16 }}>
        <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111110", margin: "0 0 4px" }}>Booking request sent</p>
        <p style={{ fontSize: "0.85rem", color: "#6b6a66", margin: 0 }}>The garage will confirm your appointment shortly. You can track it in <a href="/bookings" style={{ color: "#111110", fontWeight: 600 }}>My Bookings</a>.</p>
      </div>
    )
  }

  if (isLoaded && !isSignedIn) {
    return (
      <div>
        <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: 18, color: "#111110", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Book an appointment
        </h3>
        <div style={{ background: "#f4f3ef", borderRadius: 10, padding: "16px" }}>
          <p style={{ fontSize: "0.875rem", color: "#111110", fontWeight: 600, margin: "0 0 4px" }}>Sign up to book</p>
          <p style={{ fontSize: "0.82rem", color: "#6b6a66", margin: "0 0 14px" }}>Create a free account to pick a time and request your appointment.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <SignUpButton mode="modal" forceRedirectUrl={`/onboarding?returnTo=${encodeURIComponent(`/garages/${garageId}`)}`}>
              <button style={{ background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "10px 18px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                Sign up to book
              </button>
            </SignUpButton>
            <SignInButton mode="modal" forceRedirectUrl={`/garages/${garageId}`}>
              <button style={{ background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", borderRadius: 100, padding: "10px 18px", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                Log in
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split("T")[0]
  const serviceReady = service === "__other__" ? customService.trim().length > 0 : !!service
  const canBook = !loading && serviceReady && !!date && !!time && !!selectedVehicle && services.length > 0

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: 18, color: "#111110", marginBottom: 20, letterSpacing: "-0.02em" }}>
        Book an appointment
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <div>
          <label style={lbl}>Vehicle</label>
          {vehicles === null ? (
            <p style={{ fontSize: "0.875rem", color: "#6b6a66" }}>Loading your vehicles…</p>
          ) : vehicles.length === 0 ? (
            <div style={{ background: "#f4f3ef", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ fontSize: "0.875rem", color: "#111110", fontWeight: 600, margin: "0 0 4px" }}>No vehicles on your profile</p>
              <p style={{ fontSize: "0.82rem", color: "#6b6a66", margin: "0 0 10px" }}>Add your vehicle first so the garage knows what to expect.</p>
              <a href="/vehicles" style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111110", textDecoration: "underline" }}>Add a vehicle →</a>
            </div>
          ) : (
            <select
              value={selectedVehicle?.id ?? ""}
              onChange={e => {
                const v = vehicles.find(v => v.id === e.target.value) ?? null
                setSelectedVehicle(v)
              }}
              style={inp}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.registration} — {v.make} {v.model} ({v.year})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label style={lbl}>Service</label>
          {services.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#6b6a66", padding: "10px 14px", background: "#f4f3ef", borderRadius: 10 }}>
              No services configured yet.
            </p>
          ) : (
            <>
              <select value={service} onChange={e => setService(e.target.value)} style={inp}>
                <option value="">Select a service</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
                <option value="__other__">Not sure — describe your issue</option>
              </select>
              {service && service !== "__other__" && servicePricing[service] && (
                (() => {
                  const p = servicePricing[service]
                  if (!p.min && !p.max) return null
                  const label = p.min && p.max ? `£${p.min} – £${p.max}` : p.min ? `From £${p.min}` : `Up to £${p.max}`
                  return (
                    <p style={{ fontSize: "0.8rem", color: "#444441", fontWeight: 600, marginTop: 6 }}>
                      Estimated cost: {label}
                    </p>
                  )
                })()
              )}
              {service === "__other__" && (
                <textarea
                  placeholder="Describe what's wrong or what you'd like checked…"
                  value={customService}
                  onChange={e => setCustomService(e.target.value)}
                  rows={3}
                  style={{ ...inp, borderRadius: 12, resize: "vertical", marginTop: 8, padding: "10px 16px" }}
                />
              )}
            </>
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
                    className="slot-btn"
                    style={{
                      padding: "10px 16px", borderRadius: 100,
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

        {error && (
          <div style={{ background: "#fef2f2", border: "0.5px solid rgba(220,38,38,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: "0.85rem", color: "#dc2626", fontWeight: 500 }}>
            {error}
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
