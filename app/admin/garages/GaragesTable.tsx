"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import ApproveGarageButton from "./ApproveGarageButton"
import DeleteGarageButton from "./DeleteGarageButton"

type Garage = {
  id: string
  name: string
  city: string
  rating: number
  logoUrl: string | null
  email: string | null
  phone: string | null
  approved: boolean
  createdAt: Date
}

type Owner = { garageId: string | null; email: string; role: string; id: string }

export default function GaragesTable({
  garages,
  bookingMap,
  reviewMap,
  ownerMap,
}: {
  garages: Garage[]
  bookingMap: Record<string, number>
  reviewMap: Record<string, number>
  ownerMap: Record<string, Owner>
}) {
  const [search, setSearch] = useState("")

  const filtered = garages.filter(g => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      g.name.toLowerCase().includes(q) ||
      g.city.toLowerCase().includes(q) ||
      g.email?.toLowerCase().includes(q) ||
      ownerMap[g.id]?.email.toLowerCase().includes(q)
    )
  })

  // Pending first, then by created date desc
  const sorted = [...filtered].sort((a, b) => {
    const aPending = ownerMap[a.id]?.role === "pending" ? 0 : 1
    const bPending = ownerMap[b.id]?.role === "pending" ? 0 : 1
    if (aPending !== bPending) return aPending - bPending
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by name, city, or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 380, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "9px 18px", fontSize: "0.875rem", background: "#ffffff", color: "#111110", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      <div className="table-wrap" style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f4f3ef", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
              {["Logo", "Name", "City", "Owner", "Status", "Rating", "Reviews", "Bookings", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#444441", fontSize: "0.75rem", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((garage, i) => {
              const owner = ownerMap[garage.id]
              const isPending = owner?.role === "pending"
              return (
                <tr key={garage.id} style={{ borderBottom: i < sorted.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none", background: isPending ? "#fffbeb" : undefined }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f4f3ef", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      {garage.logoUrl
                        ? <Image src={garage.logoUrl} alt="" fill sizes="36px" style={{ objectFit: "cover" }} />
                        : <span style={{ fontSize: "0.75rem", color: "#6b6a66" }}>—</span>
                      }
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/garages/${garage.id}`} style={{ fontWeight: 600, color: "#111110", textDecoration: "none" }}>
                      {garage.name}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b6a66" }}>{garage.city}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div>
                      {garage.email
                        ? <div style={{ color: "#444441", fontSize: "0.8rem" }}>{garage.email}</div>
                        : <span style={{ color: "#dc2626", fontSize: "0.78rem", fontWeight: 600 }}>No email</span>
                      }
                      {garage.phone && <div style={{ color: "#6b6a66", fontSize: "0.78rem" }}>{garage.phone}</div>}
                      {isPending && (
                        <span style={{ background: "#fef3c7", color: "#92400e", padding: "1px 8px", borderRadius: 100, fontSize: "0.7rem", fontWeight: 700, display: "inline-block", marginTop: "2px" }}>
                          Owner pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {garage.approved
                      ? <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700 }}>Live</span>
                      : <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700 }}>Pending</span>
                    }
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {garage.rating > 0
                      ? <span style={{ color: "#111110", fontWeight: 600 }}>★ {garage.rating.toFixed(1)}</span>
                      : <span style={{ color: "#d1d0cb" }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6b6a66" }}>{reviewMap[garage.id] ?? 0}</td>
                  <td style={{ padding: "12px 16px", color: "#6b6a66" }}>{bookingMap[garage.id] ?? 0}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <Link
                        href={`/garages/${garage.id}`}
                        target="_blank"
                        style={{ background: "transparent", color: "#444441", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "4px 12px", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                      >
                        View
                      </Link>
                      {!garage.approved && <ApproveGarageButton garageId={garage.id} />}
                      <DeleteGarageButton garageId={garage.id} garageName={garage.name} />
                    </div>
                  </td>
                </tr>
              )
            })}
            {sorted.length === 0 && (
              <tr><td colSpan={9} style={{ padding: "32px", textAlign: "center", color: "#6b6a66" }}>No garages match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
