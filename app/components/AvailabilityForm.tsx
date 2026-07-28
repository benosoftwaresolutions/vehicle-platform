"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]

type DaySchedule = { day: string; isOpen: boolean; startTime: string; endTime: string }
type Props = {
  garageId: string
  existing: { slotDuration: number; capacity: number | null; schedule: DaySchedule[] } | null
}

const defaultSchedule: DaySchedule[] = days.map(day => ({
  day,
  isOpen: true,
  startTime: "08:00",
  endTime: ["Saturday","Sunday"].includes(day) ? "13:00" : "17:00",
}))

export default function AvailabilityForm({ garageId, existing }: Props) {
  const router = useRouter()
  const [slotDuration, setSlotDuration] = useState(existing?.slotDuration || 60)
  // null = no limit (default): every request comes through and the garage
  // accepts or declines based on real capacity on the day.
  const [capacity, setCapacity] = useState<number | null>(existing ? existing.capacity : null)
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    if (!existing?.schedule.length) return defaultSchedule
    // Merge saved schedule with defaults. For sat/sun: if they were saved
    // as closed with the old default times (08:00–17:00), upgrade to the
    // new default (open until 13:00) since that was never an explicit choice.
    return defaultSchedule.map(def => {
      const saved = existing.schedule.find(s => s.day === def.day)
      if (!saved) return def
      const isOldWeekendDefault = ["Saturday","Sunday"].includes(def.day)
        && !saved.isOpen && saved.startTime === "08:00" && saved.endTime === "17:00"
      if (isOldWeekendDefault) return def
      return { day: saved.day, isOpen: saved.isOpen, startTime: saved.startTime, endTime: saved.endTime }
    })
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Auto-dismiss the saved toast
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(false), 3500)
    return () => clearTimeout(t)
  }, [success])

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) =>
    setSchedule(prev => prev.map(d => d.day === day ? { ...d, [field]: value } : d))

  const handleSave = async () => {
    setLoading(true); setSuccess(false); setError("")
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId, slotDuration, capacity, schedule }),
      })
      if (res.ok) { setSuccess(true); router.refresh() }
      else setError("Something went wrong. Please try again.")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {success && (
        <div
          role="status"
          style={{
            position: "fixed", bottom: 32, left: "50%", zIndex: 30,
            background: "#111110", color: "#ffffff",
            padding: "13px 24px", borderRadius: 100,
            display: "flex", alignItems: "center", gap: 10,
            fontWeight: 600, fontSize: "0.9rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
            animation: "fycaToastIn 0.25s ease",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{
            background: "#16a34a", borderRadius: "50%", width: 20, height: 20,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 800, flexShrink: 0,
          }}>✓</span>
          Availability saved — your bookable slots are updated
        </div>
      )}
      <style>{`
        @keyframes fycaToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      {error && (
        <div style={{ background: "#fef2f2", borderRadius: 10, padding: "14px 16px", color: "#dc2626", fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* General settings */}
      <div style={card}>
        <h3 style={h3}>General settings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={lbl}>Slot duration</label>
            <select value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))} style={inp}>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Bookings per time slot</label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "9px 0" }}>
              <input
                type="checkbox"
                checked={capacity === null}
                onChange={e => setCapacity(e.target.checked ? null : 2)}
              />
              <span style={{ fontSize: "0.85rem", color: "#111110" }}>
                No limit — I&apos;ll accept or decline each request
              </span>
            </label>
            {capacity !== null && (
              <input
                type="number" value={capacity}
                onChange={e => setCapacity(Number(e.target.value))}
                min={1} max={20}
                style={inp}
              />
            )}
          </div>
        </div>
      </div>

      {/* Opening hours */}
      <div style={card}>
        <h3 style={h3}>Opening hours</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {schedule.map(day => (
            <div key={day.day} style={{ display: "grid", gridTemplateColumns: "110px 80px 1fr 1fr", alignItems: "center", gap: 12 }}>
              <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111110" }}>{day.day}</span>
              <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={e => updateDay(day.day, "isOpen", e.target.checked)}
                />
                <span style={{ fontSize: "0.85rem", color: day.isOpen ? "#111110" : "#6b6a66" }}>
                  {day.isOpen ? "Open" : "Closed"}
                </span>
              </label>
              {day.isOpen ? (
                <>
                  <div>
                    <label style={{ ...lbl, fontSize: "0.72rem" }}>Opens</label>
                    <input type="time" value={day.startTime} onChange={e => updateDay(day.day, "startTime", e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ ...lbl, fontSize: "0.72rem" }}>Closes</label>
                    <input type="time" value={day.endTime} onChange={e => updateDay(day.day, "endTime", e.target.value)} style={inp} />
                  </div>
                </>
              ) : (
                <span style={{ color: "#6b6a66", fontSize: "0.85rem", gridColumn: "span 2" }}>Closed all day</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          background: loading ? "#eceae4" : success ? "#16a34a" : "#111110",
          color: loading ? "#6b6a66" : "#ffffff",
          padding: "13px 32px", borderRadius: 100,
          fontWeight: 600, fontSize: "0.95rem",
          border: "none", cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s ease",
        }}
      >
        {loading ? "Saving…" : success ? "✓ Saved" : "Save availability"}
      </button>
    </div>
  )
}

const card: React.CSSProperties = { background: "#f4f3ef", borderRadius: 14, padding: 22 }
const h3: React.CSSProperties = { fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: 17, color: "#111110", letterSpacing: "-0.02em", marginBottom: 16 }
const lbl: React.CSSProperties = { fontSize: "0.8rem", fontWeight: 600, color: "#444441", display: "block", marginBottom: 5 }
const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "9px 12px", fontSize: "0.875rem", background: "#ffffff", color: "#111110" }
