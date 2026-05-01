"use client"

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

function FycaLogo() {
  return (
    <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 11, background: "#111110",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ color: "#ffffff", fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 700, fontSize: 16, lineHeight: 1, letterSpacing: "-0.04em" }}>F</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span className="logo-wordmark" style={{ fontFamily: "var(--font-fraunces), 'Fraunces', serif", fontSize: 18, fontWeight: 700, letterSpacing: "-0.04em", color: "#111110", lineHeight: 1 }}>
          Fyca
        </span>
        <span className="logo-tagline" style={{ fontSize: 8, fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: "#aaa9a4", lineHeight: 1 }}>
          Fix Your Car Anywhere
        </span>
      </div>
    </Link>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div style={{ width: 22, height: 16, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <span style={{
        display: "block", height: 1.5, background: "#111110", borderRadius: 2,
        transition: "transform 0.2s",
        transform: open ? "translateY(7px) rotate(45deg)" : "none",
      }} />
      <span style={{
        display: "block", height: 1.5, background: "#111110", borderRadius: 2,
        transition: "opacity 0.2s", opacity: open ? 0 : 1,
      }} />
      <span style={{
        display: "block", height: 1.5, background: "#111110", borderRadius: 2,
        transition: "transform 0.2s",
        transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
      }} />
    </div>
  )
}

export default function Navbar({ role }: { role?: string }) {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  // Close on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  // Track viewport so we only mount UserButton on desktop —
  // prevents Clerk rendering a floating avatar when nav-desktop is CSS-hidden on mobile
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    setIsDesktop(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false) }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [menuOpen])

  const isGarageOwner = role === "garage_owner"
  const onGarages = pathname === "/for-garages"
  const onDrivers = pathname === "/for-drivers"

  return (
    <>
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
        <FycaLogo />

        {/* Desktop: centre nav */}
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Link href="/" className="nav-link" style={navLink}>Home</Link>
            <Link href="/garages" className="nav-link" style={navLink}>Garages</Link>
            {isSignedIn && (isGarageOwner
              ? <Link href="/garage-dashboard" className="nav-link" style={navLink}>Dashboard</Link>
              : <Link href="/bookings" className="nav-link" style={navLink}>My Bookings</Link>
            )}
          </div>
          <div style={{ width: "0.5px", height: 18, background: "rgba(0,0,0,0.15)" }} />
          <div style={{ background: "#f4f3ef", borderRadius: 100, padding: 3, display: "flex", gap: 2 }}>
            <Link href="/for-garages" style={{
              padding: "5px 14px", borderRadius: 100, fontSize: "0.82rem", fontWeight: 600,
              textDecoration: "none",
              background: onGarages ? "#111110" : "transparent",
              color: onGarages ? "#ffffff" : "#444441",
            }}>For garages</Link>
            <Link href="/for-drivers" style={{
              padding: "5px 14px", borderRadius: 100, fontSize: "0.82rem", fontWeight: 600,
              textDecoration: "none",
              background: onDrivers ? "#111110" : "transparent",
              color: onDrivers ? "#ffffff" : "#444441",
            }}>For drivers</Link>
          </div>
        </div>

        {/* Desktop: auth — UserButton only mounted when actually on desktop */}
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="nav-link" style={navLink as React.CSSProperties}>Log in</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button style={{ background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "9px 20px", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                  Sign up
                </button>
              </SignUpButton>
            </>
          ) : isDesktop ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link label="My Profile" href="/profile" labelIcon={<ProfileIcon />} />
              </UserButton.MenuItems>
            </UserButton>
          ) : null}
        </div>

        {/* Mobile: hamburger */}
        <button
          className="nav-mobile"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: -12 }}
        >
          <HamburgerIcon open={menuOpen} />
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div className="nav-mobile" style={{
          position: "fixed", top: 56, left: 0, right: 0, bottom: 0,
          background: "#ffffff", zIndex: 49, overflowY: "auto",
          display: "flex", flexDirection: "column",
          padding: "8px 0 40px",
          borderTop: "0.5px solid rgba(0,0,0,0.08)",
        }}>
          {/* Primary links */}
          <div style={{ padding: "8px 16px" }}>
            <Link href="/" className="mobile-link" style={mobileLink}>Home</Link>
            <Link href="/garages" className="mobile-link" style={mobileLink}>Garages</Link>
            {isSignedIn && (isGarageOwner
              ? <Link href="/garage-dashboard" className="mobile-link" style={mobileLink}>Dashboard</Link>
              : <Link href="/bookings" className="mobile-link" style={mobileLink}>My Bookings</Link>
            )}
          </div>

          <div style={{ height: "0.5px", background: "rgba(0,0,0,0.08)", margin: "8px 16px" }} />

          {/* For garages / drivers */}
          <div style={{ padding: "8px 16px" }}>
            <Link href="/for-garages" className="mobile-link" style={{ ...mobileLink, background: onGarages ? "#f4f3ef" : "transparent" }}>For garages</Link>
            <Link href="/for-drivers" className="mobile-link" style={{ ...mobileLink, background: onDrivers ? "#f4f3ef" : "transparent" }}>For drivers</Link>
          </div>

          <div style={{ height: "0.5px", background: "rgba(0,0,0,0.08)", margin: "8px 16px" }} />

          {/* Auth */}
          <div style={{ padding: "16px 16px 0" }}>
            {!isSignedIn ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <SignInButton mode="modal">
                  <button style={{ width: "100%", background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", borderRadius: 100, padding: "13px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button style={{ width: "100%", background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "13px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Get started
                  </button>
                </SignUpButton>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
                <UserButton>
                  <UserButton.MenuItems>
                    <UserButton.Link label="My Profile" href="/profile" labelIcon={<ProfileIcon />} />
                  </UserButton.MenuItems>
                </UserButton>
                <span style={{ fontSize: "0.875rem", color: "#444441" }}>My account</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M2.5 13.5c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

const navLink: React.CSSProperties = {
  background: "none", border: "none", fontSize: "0.875rem", fontWeight: 500,
  color: "#444441", cursor: "pointer", padding: "6px 10px", borderRadius: 8,
  textDecoration: "none", fontFamily: "var(--font-dm-sans), sans-serif",
}

const mobileLink: React.CSSProperties = {
  display: "block", padding: "12px 14px", borderRadius: 10,
  fontSize: "1rem", fontWeight: 500, color: "#111110",
  textDecoration: "none", fontFamily: "var(--font-dm-sans), sans-serif",
}
