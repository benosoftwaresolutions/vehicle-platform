"use client"

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"

function DryvnLogo() {
  return (
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: "#111110",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M7.5 12V3M7.5 3L3 7.5M7.5 3L12 7.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span style={{
        fontFamily: "var(--font-fraunces), 'Fraunces', serif",
        fontSize: 18, fontWeight: 600, letterSpacing: "-0.03em",
        color: "#111110",
      }}>
        dryvn
      </span>
    </Link>
  )
}

export default function Navbar({ role }: { role?: string }) {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const isGarageOwner = role === "garage_owner"
  const onGarages = pathname === "/for-garages"
  const onDrivers = pathname === "/for-drivers"

  return (
    <nav style={{
      background: "#ffffff",
      borderBottom: "0.5px solid rgba(0,0,0,0.12)",
      height: 56,
      padding: "0 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <DryvnLogo />

      {/* Centre: app nav + landing toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Link href="/" style={navLink}>Home</Link>
          <Link href="/garages" style={navLink}>Garages</Link>
          {isGarageOwner
            ? <Link href="/garage-dashboard" style={navLink}>Dashboard</Link>
            : <Link href="/bookings" style={navLink}>My Bookings</Link>
          }
        </div>

        {/* Divider */}
        <div style={{ width: "0.5px", height: 18, background: "rgba(0,0,0,0.15)" }} />

        {/* Toggle pill */}
        <div style={{ background: "#f4f3ef", borderRadius: 100, padding: 3, display: "flex", gap: 2 }}>
          <Link href="/for-garages" style={{
            padding: "5px 14px", borderRadius: 100,
            fontSize: "0.82rem", fontWeight: 600,
            textDecoration: "none",
            background: onGarages ? "#111110" : "transparent",
            color: onGarages ? "#ffffff" : "#444441",
          }}>For garages</Link>
          <Link href="/for-drivers" style={{
            padding: "5px 14px", borderRadius: 100,
            fontSize: "0.82rem", fontWeight: 600,
            textDecoration: "none",
            background: onDrivers ? "#111110" : "transparent",
            color: onDrivers ? "#ffffff" : "#444441",
          }}>For drivers</Link>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {!isSignedIn ? (
          <>
            <SignInButton mode="modal">
              <button style={navLink as React.CSSProperties}>Log in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button style={{
                background: "#111110", color: "#ffffff",
                border: "none", borderRadius: 100,
                padding: "9px 20px", fontSize: "0.85rem",
                fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-dm-sans), sans-serif",
              }}>
                Sign up
              </button>
            </SignUpButton>
          </>
        ) : (
          <UserButton />
        )}
      </div>
    </nav>
  )
}

const navLink: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#444441",
  cursor: "pointer",
  padding: "6px 10px",
  borderRadius: 8,
  textDecoration: "none",
  fontFamily: "var(--font-dm-sans), sans-serif",
  transition: "color 0.15s",
}
