"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Booking = {
  id: string
  service: string
  date: string
  time: string
  registration: string
  status: string
  customerName: string | null
  isWalkIn: boolean
}

const HOURS = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"]
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

export default function CalendarView({ bookings, weekStart, weekOffset }: { bookings: Booking[]; weekStart: string; weekOffset: number }) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const router = useRouter()

  const ws = new Date(weekStart)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws)
    d.setDate(ws.getDate() + i)
    return d
  })

  const bookingsByDayTime: Record<string, Record<string, Booking[]>> = {}
  for (const b of bookings) {
    const d = new Date(b.date)
    const key = d.toDateString()
    if (!bookingsByDayTime[key]) bookingsByDayTime[key] = {}
    if (!bookingsByDayTime[key][b.time]) bookingsByDayTime[key][b.time] = []
    bookingsByDayTime[key][b.time].push(b)
  }

  const today = new Date().toDateString()

  return (
    <div>
      {/* Week nav header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", margin: 0 }}>
          {ws.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} – {days[6].toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.85rem", color: "#6b6a66", marginRight: 8 }}>{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</span>
          <button onClick={() => router.push(`/garage-dashboard/calendar?week=${weekOffset - 1}`)} style={navBtn}>← Prev</button>
          {weekOffset !== 0 && (
            <button onClick={() => router.push("/garage-dashboard/calendar")} style={navBtn}>Today</button>
          )}
          <button onClick={() => router.push(`/garage-dashboard/calendar?week=${weekOffset + 1}`)} style={navBtn}>Next →</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 700 }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
            <div />
            {days.map((d, i) => (
              <div key={i} style={{
                textAlign: "center", padding: "8px 4px",
                background: d.toDateString() === today ? "#111110" : "#f4f3ef",
                color: d.toDateString() === today ? "#ffffff" : "#444441",
                borderRadius: 8, fontSize: "0.8rem", fontWeight: 700,
              }}>
                <div>{DAYS[i]}</div>
                <div style={{ fontSize: "0.9rem" }}>{d.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Time rows */}
          {HOURS.map(hour => (
            <div key={hour} style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: "4px", marginBottom: "3px" }}>
              <div style={{ fontSize: "0.72rem", color: "#6b6a66", paddingTop: "6px", textAlign: "right", paddingRight: "8px" }}>{hour}</div>
              {days.map((d, i) => {
                const slots = bookingsByDayTime[d.toDateString()]?.[hour] ?? []
                return (
                  <div key={i} style={{ minHeight: "36px", background: slots.length ? "transparent" : "#f9f8f5", borderRadius: 6, display: "flex", flexDirection: "column", gap: "2px" }}>
                    {slots.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBooking(b)}
                        style={{
                          background: b.status === "confirmed" ? "#111110" : "#eceae4",
                          color: b.status === "confirmed" ? "#ffffff" : "#111110",
                          border: "none", borderRadius: 6, padding: "4px 7px",
                          fontSize: "0.72rem", fontWeight: 600, cursor: "pointer",
                          textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          width: "100%",
                        }}
                      >
                        {b.registration} · {b.service}
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Booking detail modal */}
      {selectedBooking && (
        <div
          onClick={() => setSelectedBooking(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: "#ffffff", borderRadius: 16, padding: "28px", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", color: "#111110", margin: "0 0 16px" }}>
              {selectedBooking.service}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.875rem" }}>
              <Row label="Registration" value={selectedBooking.registration} />
              <Row label="Date" value={new Date(selectedBooking.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
              <Row label="Time" value={selectedBooking.time} />
              <Row label="Status" value={selectedBooking.status} />
              {selectedBooking.isWalkIn && selectedBooking.customerName && (
                <Row label="Customer" value={selectedBooking.customerName} />
              )}
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              style={{ marginTop: "20px", background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "10px 24px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", width: "100%" }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background: "transparent", border: "0.5px solid rgba(0,0,0,0.2)", borderRadius: 100,
  padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600, color: "#111110", cursor: "pointer",
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "12px" }}>
      <span style={{ color: "#6b6a66", width: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#111110", fontWeight: 600 }}>{value}</span>
    </div>
  )
}
