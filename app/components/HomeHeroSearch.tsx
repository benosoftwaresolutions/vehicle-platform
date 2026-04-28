"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const SERVICES = ["MOT", "Service", "Tyres", "Brakes", "Diagnostics", "Other"]

export default function HomeHeroSearch() {
  const router = useRouter()
  const [location, setLocation] = useState("")
  const [service, setService] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location.trim()) params.set("q", location.trim())
    if (service) params.set("service", service)
    router.push(`/garages${params.toString() ? `?${params}` : ""}`)
  }

  return (
    <form onSubmit={handleSearch} style={{
      background: "#ffffff",
      border: "0.5px solid rgba(0,0,0,0.12)",
      borderRadius: 14,
      padding: 8,
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      maxWidth: 640,
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    }}>
      <input
        type="text"
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder="Town, city or postcode"
        style={{
          flex: "1 1 180px",
          border: "none",
          outline: "none",
          fontSize: "0.9rem",
          color: "#111110",
          background: "transparent",
          padding: "10px 14px",
          minWidth: 0,
        }}
      />
      <div style={{ width: "0.5px", background: "rgba(0,0,0,0.10)", alignSelf: "stretch", flexShrink: 0 }} />
      <select
        value={service}
        onChange={e => setService(e.target.value)}
        style={{
          flex: "1 1 140px",
          border: "none",
          outline: "none",
          fontSize: "0.9rem",
          color: service ? "#111110" : "#6b6a66",
          background: "transparent",
          padding: "10px 14px",
          cursor: "pointer",
          minWidth: 0,
        }}
      >
        <option value="">Any service</option>
        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="submit" style={{
        background: "#111110",
        color: "#ffffff",
        border: "none",
        borderRadius: 10,
        padding: "11px 22px",
        fontSize: "0.9rem",
        fontWeight: 600,
        cursor: "pointer",
        flexShrink: 0,
        whiteSpace: "nowrap",
        fontFamily: "var(--font-dm-sans), sans-serif",
      }}>
        Search garages
      </button>
    </form>
  )
}
