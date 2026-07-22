"use client"

import { useState, useMemo, useTransition } from "react"
import { adminUpdateBookingStatus } from "../actions"

type Booking = {
  id: string
  service: string
  date: Date
  time: string
  status: string
  isWalkIn: boolean
  registration: string
  customerEmail: string | null
  customerName: string | null
  garageName: string
}

const STATUS_STYLES: Record<string, { bg: string; color: string; textDecoration?: string }> = {
  pending:              { bg: "#f4f3ef", color: "#444441" },
  confirmed:            { bg: "#111110", color: "#ffffff" },
  declined:             { bg: "#eceae4", color: "#111110", textDecoration: "line-through" },
  declined_by_customer: { bg: "#f4f3ef", color: "#6b6a66" },
  completed:            { bg: "#eceae4", color: "#111110" },
}

const ALL_STATUSES = ["pending", "confirmed", "declined", "declined_by_customer", "completed"]

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
  const [statusFilter, setStatusFilter] = useState("")

  const filtered = useMemo(() =>
    statusFilter ? bookings.filter((b) => b.status === statusFilter) : bookings,
    [bookings, statusFilter]
  )

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "8px 16px", fontSize: "0.875rem", background: "#ffffff", color: "#111110", cursor: "pointer" }}
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span style={{ color: "#6b6a66", fontSize: "0.875rem" }}>
          {filtered.length} of {bookings.length} bookings
        </span>
      </div>

      <div className="table-wrap" style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f4f3ef", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
              {["Garage", "Customer", "Service", "Date", "Status", "Type", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#444441", fontSize: "0.75rem", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking, i) => {
              const s = STATUS_STYLES[booking.status] ?? { bg: "#f4f3ef", color: "#444441" }
              return (
                <tr key={booking.id} style={{ borderBottom: i < filtered.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111110" }}>{booking.garageName}</td>
                  <td style={{ padding: "12px 16px", color: "#444441" }}>
                    {booking.customerName && <div style={{ fontWeight: 500 }}>{booking.customerName}</div>}
                    <div style={{ color: "#6b6a66", fontSize: "0.8rem" }}>{booking.customerEmail ?? "—"}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#444441" }}>{booking.service}</td>
                  <td style={{ padding: "12px 16px", color: "#6b6a66", whiteSpace: "nowrap" }}>
                    {new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} {booking.time}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 100, fontSize: "0.73rem", fontWeight: 700, textDecoration: s.textDecoration }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {booking.isWalkIn
                      ? <span style={{ background: "#eceae4", color: "#111110", padding: "3px 10px", borderRadius: 100, fontSize: "0.73rem", fontWeight: 700 }}>Walk-in</span>
                      : <span style={{ color: "#6b6a66", fontSize: "0.8rem" }}>Online</span>
                    }
                  </td>
                  <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                    {booking.status === "pending" && <RowActions bookingId={booking.id} />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ padding: "48px", textAlign: "center", color: "#6b6a66" }}>No bookings match this filter.</p>
        )}
      </div>
    </>
  )
}

// Accept / decline a pending booking on the garage's behalf. Internal support
// tool — the customer just sees the normal confirmation or decline email.
function RowActions({ bookingId }: { bookingId: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState(false)

  const act = (status: "confirmed" | "declined") => {
    if (status === "declined" && !confirm("Decline this booking on the garage's behalf? The customer will be emailed.")) return
    setError(false)
    startTransition(async () => {
      try {
        await adminUpdateBookingStatus(bookingId, status)
      } catch {
        setError(true)
      }
    })
  }

  if (error) return <span style={{ color: "#dc2626", fontSize: "0.78rem", fontWeight: 600 }}>Failed — retry</span>

  return (
    <div style={{ display: "flex", gap: "6px" }}>
      <button
        onClick={() => act("confirmed")}
        disabled={pending}
        style={{ background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700, cursor: pending ? "wait" : "pointer", opacity: pending ? 0.5 : 1 }}
      >
        {pending ? "…" : "Accept"}
      </button>
      <button
        onClick={() => act("declined")}
        disabled={pending}
        style={{ background: "transparent", color: "#444441", border: "0.5px solid rgba(0,0,0,0.2)", borderRadius: 100, padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700, cursor: pending ? "wait" : "pointer", opacity: pending ? 0.5 : 1 }}
      >
        Decline
      </button>
    </div>
  )
}
