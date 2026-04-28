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
            width: 30, height: 30, borderRadius: 11, background: "#111110",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ color: "#ffffff", fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 700, fontSize: 16, lineHeight: 1, letterSpacing: "-0.04em" }}>F</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.04em", color: "#111110", lineHeight: 1,
            }}>Fyca</span>
            <span style={{ fontSize: 8, fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: "#aaa9a4", lineHeight: 1 }}>
              Fix Your Car Anywhere
            </span>
          </div>
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
