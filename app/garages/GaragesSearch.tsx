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
}: {
  garages: Garage[]
  allServices: string[]
}) {
  const [search, setSearch] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return garages.filter((g) => {
      const matchesSearch =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.city.toLowerCase().includes(q) ||
        g.postcode.toLowerCase().includes(q)

      const matchesService =
        !serviceFilter || g.services.includes(serviceFilter)

      return matchesSearch && matchesService
    })
  }, [garages, search, serviceFilter])

  return (
    <>
      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by name, city, or postcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: "1 1 260px", border: "1px solid #e5e7eb", borderRadius: "10px",
            padding: "10px 16px", fontSize: "0.95rem", outline: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        />
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          style={{
            flex: "0 1 200px", border: "1px solid #e5e7eb", borderRadius: "10px",
            padding: "10px 16px", fontSize: "0.95rem", outline: "none",
            background: "white", cursor: "pointer",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
              background: "none", border: "1px solid #e5e7eb", borderRadius: "10px",
              padding: "10px 16px", fontSize: "0.875rem", color: "#64748b",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Result count */}
      {(search || serviceFilter) && (
        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "16px" }}>
          {filtered.length} {filtered.length === 1 ? "garage" : "garages"} found
        </p>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{
          background: "white", borderRadius: "16px", padding: "48px",
          textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}>
          <p style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔍</p>
          <h2 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "8px" }}>No garages found</h2>
          <p style={{ color: "#64748b" }}>
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
              services={garage.services.join(", ")}
              logoUrl={garage.logoUrl}
            />
          ))}
        </div>
      )}
    </>
  )
}
