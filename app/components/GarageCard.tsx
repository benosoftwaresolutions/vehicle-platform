"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"

type GarageCardProps = {
  id: string
  name: string
  location: string
  rating: string
  reviewCount: number
  services: string
  logoUrl?: string | null
}

function initials(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0][0].toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export default function GarageCard({ id, name, location, rating, reviewCount, services, logoUrl }: GarageCardProps) {
  const [favourited, setFavourited] = useState(false)

  return (
    <div style={{
      background: "#f4f3ef",
      borderRadius: 14,
      overflow: "hidden",
      transition: "background 0.15s",
      cursor: "pointer",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "#eceae4")}
      onMouseLeave={e => (e.currentTarget.style.background = "#f4f3ef")}
    >
      {/* Image / logo area */}
      <div style={{ height: 140, background: "#eceae4", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
        {logoUrl
          ? <Image src={logoUrl} alt={`${name} logo`} fill sizes="140px" style={{ objectFit: "cover" }} />
          : (
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", border: "0.5px solid rgba(0,0,0,0.08)" }}>
              <span style={{ fontFamily: "var(--font-dm-sans),'DM Sans',sans-serif", fontWeight: 700, fontSize: "1rem", color: "#111110", letterSpacing: "0.02em" }}>
                {initials(name)}
              </span>
            </div>
          )
        }
        <button
          onClick={(e) => { e.preventDefault(); setFavourited(!favourited) }}
          style={{ position: "absolute", top: 10, right: 10, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.9rem" }}
        >
          {favourited ? "♥" : "♡"}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 18px 18px" }}>
        <Link href={`/garages/${id}`} style={{ textDecoration: "none" }}>
          <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: 17, color: "#111110", marginBottom: 4, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {name}
          </h3>
        </Link>
        <p style={{ fontSize: "0.8rem", color: "#6b6a66", marginBottom: 4 }}>{location}</p>
        <p style={{ fontSize: "0.8rem", color: "#444441", fontWeight: 500, marginBottom: 10 }}>
          {parseFloat(rating) > 0
            ? <>★ {parseFloat(rating).toFixed(1)}{reviewCount > 0 && <span style={{ color: "#6b6a66", fontWeight: 400 }}> ({reviewCount})</span>}</>
            : <span style={{ color: "#6b6a66" }}>No reviews yet</span>
          }
        </p>
        {services && (
          <p style={{ fontSize: "0.75rem", color: "#6b6a66", marginBottom: 14, lineHeight: 1.5 }}>
            {services.length > 60 ? services.slice(0, 60) + "…" : services}
          </p>
        )}
        <Link
          href={`/garages/${id}`}
          style={{
            display: "block", textAlign: "center",
            background: "#111110", color: "#ffffff",
            padding: "9px 0", borderRadius: 100,
            fontSize: "0.85rem", fontWeight: 600, textDecoration: "none",
          }}
        >
          Book now
        </Link>
      </div>
    </div>
  )
}
