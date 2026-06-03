"use client"

import { useState, useMemo } from "react"
import Link from "next/link"

type Garage = {
  id: string
  name: string
  city: string
  postcode: string
  services: string[]
  specialistMakes: string[]
  rating: number
  logoUrl: string | null
  reviewCount: number
}

export default function GarageSearchPreview({ garages }: { garages: Garage[] }) {
  const [query, setQuery] = useState("")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return garages.slice(0, 3)
    return garages.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.city.toLowerCase().includes(q) ||
      g.postcode.toLowerCase().includes(q) ||
      (g.services ?? []).some(s => s.toLowerCase().includes(q)) ||
      (g.specialistMakes ?? []).some(m => m.toLowerCase().includes(q))
    ).slice(0, 5)
  }, [query, garages])

  return (
    <div style={{
      background: "#ffffff",
      border: "0.5px solid rgba(0,0,0,0.10)",
      borderRadius: 16,
      overflow: "hidden",
      maxWidth: 700,
      margin: "0 auto",
    }}>
      {/* Search bar */}
      <div style={{
        padding: "10px 14px 10px 20px",
        borderBottom: "0.5px solid rgba(0,0,0,0.08)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8.5" cy="8.5" r="5.5" stroke="#6b6a66" strokeWidth="1.6"/>
          <path d="M14 14l3.5 3.5" stroke="#6b6a66" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Service, location, or specialist make…"
          style={{
            flex: 1, border: "none", outline: "none",
            fontSize: "0.9rem", color: "#111110", background: "transparent",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#6b6a66", fontSize: "1rem", lineHeight: 1, padding: "0 4px",
            }}
          >✕</button>
        )}
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div style={{ padding: "20px", color: "#6b6a66", fontSize: "0.875rem", textAlign: "center" }}>
          No garages found for &ldquo;{query}&rdquo;
        </div>
      ) : (
        results.map((g, i) => {
          const initials = g.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
          const meta = [...(g.services ?? []).slice(0, 3), ...(g.specialistMakes ?? []).slice(0, 1)].join(" · ")
          return (
            <Link key={g.id} href={`/garages/${g.id}`} style={{
              padding: "16px 20px",
              borderBottom: i < results.length - 1 ? "0.5px solid rgba(0,0,0,0.07)" : "none",
              display: "flex", alignItems: "center", gap: 14,
              textDecoration: "none",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: g.logoUrl ? "transparent" : "#111110",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden",
              }}>
                {g.logoUrl
                  ? <img src={g.logoUrl} alt={g.name} style={{ width: 40, height: 40, objectFit: "cover" }} />
                  : <span style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontSize: "0.78rem", fontWeight: 600, color: "#ffffff", letterSpacing: "0.02em" }}>{initials}</span>
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111110", margin: "0 0 2px" }}>{g.name}</p>
                <p style={{ fontSize: "0.78rem", color: "#6b6a66", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {meta}{g.city ? ` · ${g.city}` : ""}
                </p>
              </div>

              {g.rating > 0 && (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111110", margin: "0 0 2px" }}>★ {g.rating.toFixed(1)}</p>
                  <p style={{ fontSize: "0.72rem", color: "#6b6a66", margin: 0 }}>
                    {g.reviewCount} {g.reviewCount === 1 ? "review" : "reviews"}
                  </p>
                </div>
              )}

              <div style={{ flexShrink: 0 }}>
                <span style={{
                  background: "#111110", color: "#ffffff",
                  padding: "6px 14px", borderRadius: 100,
                  fontSize: "0.78rem", fontWeight: 600, display: "inline-block",
                }}>Book</span>
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}
