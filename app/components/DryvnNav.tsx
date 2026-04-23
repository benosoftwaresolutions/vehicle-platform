"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DryvnNav() {
  const pathname = usePathname()
  const onGarages = pathname === "/for-garages"
  const onDrivers = pathname === "/for-drivers"

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "#ffffff",
      borderBottom: "0.5px solid rgba(0,0,0,0.10)",
      height: 56,
      display: "flex", alignItems: "center",
      padding: "0 28px",
    }}>
      <div style={{
        maxWidth: 900, margin: "0 auto", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: "#111110",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 12V2M7 2L2 7M7 2L12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.03em", color: "#111110",
          }}>dryvn</span>
        </Link>

        {/* Toggle pill */}
        <div style={{
          background: "#f4f3ef", borderRadius: 100,
          padding: 3, display: "flex", gap: 2,
        }}>
          <Link href="/for-garages" style={{
            padding: "6px 16px", borderRadius: 100,
            fontSize: "0.84rem", fontWeight: 600,
            textDecoration: "none",
            background: onGarages ? "#111110" : "transparent",
            color: onGarages ? "#ffffff" : "#444441",
            transition: "background 0.15s, color 0.15s",
          }}>For garages</Link>
          <Link href="/for-drivers" style={{
            padding: "6px 16px", borderRadius: 100,
            fontSize: "0.84rem", fontWeight: 600,
            textDecoration: "none",
            background: onDrivers ? "#111110" : "transparent",
            color: onDrivers ? "#ffffff" : "#444441",
            transition: "background 0.15s, color 0.15s",
          }}>For drivers</Link>
        </div>

        {/* CTA */}
        <Link href="/sign-up" style={{
          background: "#111110", color: "#ffffff",
          padding: "9px 20px", borderRadius: 100,
          fontWeight: 600, fontSize: "0.875rem",
          textDecoration: "none",
        }}>Get started</Link>

      </div>
    </nav>
  )
}
