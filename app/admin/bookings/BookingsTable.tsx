"use client"

import { useState, useMemo } from "react"

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

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending:              { bg: "#fef3c7", color: "#92400e" },
  confirmed:            { bg: "#dcfce7", color: "#166534" },
  declined:             { bg: "#fee2e2", color: "#991b1b" },
  declined_by_customer: { bg: "#f1f5f9", color: "#475569" },
  completed:            { bg: "#e0f2fe", color: "#0369a1" },
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
          style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 14px", fontSize: "0.875rem", background: "white", cursor: "pointer" }}
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span style={{ color: "#64748b", fontSize: "0.875rem" }}>
          {filtered.length} of {bookings.length} bookings
        </span>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #e5e7eb" }}>
              {["Garage", "Customer", "Service", "Date", "Status", "Type"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking, i) => {
              const s = STATUS_STYLES[booking.status] ?? { bg: "#f1f5f9", color: "#475569" }
              return (
                <tr key={booking.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{booking.garageName}</td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>
                    {booking.customerName && <div style={{ fontWeight: 500 }}>{booking.customerName}</div>}
                    <div style={{ color: "#64748b", fontSize: "0.8rem" }}>{booking.customerEmail ?? "—"}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#374151" }}>{booking.service}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b", whiteSpace: "nowrap" }}>
                    {new Date(booking.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} {booking.time}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {booking.isWalkIn
                      ? <span style={{ background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>Walk-in</span>
                      : <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Online</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>No bookings match this filter.</p>
        )}
      </div>
    </>
  )
}
