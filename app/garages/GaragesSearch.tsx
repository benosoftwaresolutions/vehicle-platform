"use client"

import { useState, useMemo } from "react"
import GarageCard from "@/app/components/GarageCard"

type Garage = {
  id: string
  name: string
  address: string
  city: string
  postcode: string
  rating: number
  reviewCount: number
  services: string[]
  logoUrl: string | null
}

export default function GaragesSearch({
  garages,
  allServices,
  initialSearch = "",
  initialService = "",
}: {
  garages: Garage[]
  allServices: string[]
  initialSearch?: string
  initialService?: string
}) {
  const [search, setSearch] = useState(initialSearch)
  const [serviceFilter, setServiceFilter] = useState(initialService)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return garages.filter((g) => {
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.city.toLowerCase().includes(q) ||
        g.postcode.toLowerCase().includes(q)

      const matchesService =
        !serviceFilter || (g.services ?? []).includes(serviceFilter)

      return matchesSearch && matchesService
    })
  }, [garages, search, serviceFilter])

  return (
    <>
      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name, city, or postcode…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 260px",
            border: "0.5px solid rgba(0,0,0,0.15)",
            borderRadius: 100,
            padding: "10px 18px",
            fontSize: "0.9rem",
            outline: "none",
            background: "#ffffff",
            color: "#111110",
          }}
        />
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          style={{
            flex: "0 1 200px",
            border: "0.5px solid rgba(0,0,0,0.15)",
            borderRadius: 100,
            padding: "10px 18px",
            fontSize: "0.9rem",
            outline: "none",
            background: "#ffffff",
            color: "#111110",
            cursor: "pointer",
          }}
        >
          <option value="">All services</option>
          {allServices.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {(search || serviceFilter) && (
          <button
            onClick={() => { setSearch(""); setServiceFilter("") }}
            style={{
              background: "transparent",
              border: "0.5px solid rgba(0,0,0,0.15)",
              borderRadius: 100,
              padding: "10px 18px",
              fontSize: "0.875rem",
              color: "#444441",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Result count */}
      {(search || serviceFilter) && (
        <p style={{ color: "#6b6a66", fontSize: "0.875rem", marginBottom: "20px" }}>
          {filtered.length} {filtered.length === 1 ? "garage" : "garages"} found
        </p>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.25rem", color: "#111110", marginBottom: "8px" }}>No garages found</h2>
          <p style={{ color: "#6b6a66" }}>
            Try adjusting your search or removing the service filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((garage) => (
            <GarageCard
              key={garage.id}
              id={garage.id}
              name={garage.name}
              location={`${garage.city}, ${garage.postcode}`}
              rating={garage.rating.toFixed(1)}
              reviewCount={garage.reviewCount}
              services={(garage.services ?? []).join(", ")}
              logoUrl={garage.logoUrl}
            />
          ))}
        </div>
      )}
    </>
  )
}
