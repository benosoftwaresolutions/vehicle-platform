"use client"

import { useState } from "react"
import Link from "next/link"

export default function DashPill({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#111110" : "#f4f3ef",
        color: hovered ? "#ffffff" : "#111110",
        padding: "9px 18px",
        borderRadius: 100,
        fontWeight: 600,
        fontSize: "0.875rem",
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {children}
    </Link>
  )
}
