"use client"

import { SignInButton, SignUpButton, SignOutButton, UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef, useSyncExternalStore } from "react"
import { PLATFORM_LINKS, COMPANY_LINKS } from "@/app/lib/navLinks"

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

// Synced via useSyncExternalStore instead of useState+useEffect — the
// canonical primitive for reading a browser-only value (matchMedia here)
// that has no meaningful value during SSR, without the extra render pass an
// effect-driven setState would cost.
const DESKTOP_QUERY = "(min-width: 768px)"

function subscribeToDesktopQuery(callback: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY)
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

function getIsDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches
}

function getIsDesktopServerSnapshot() {
  return false
}

export default function Navbar({ role }: { role?: string }) {
  const { isSignedIn } = useAuth()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [fetchedRole, setFetchedRole] = useState<string | undefined>(undefined)

  // Close the mobile menu when the route changes. Navbar is hosted in
  // garage-dashboard's layout, so it persists across client-side navigations
  // there rather than remounting — this can't just be "start closed" state.
  // Adjusting state during render (React's documented pattern for "reset
  // state when a prop changes") instead of in an effect: one extra render
  // pass instead of a mount render followed by a second effect-driven one.
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setMenuOpen(false)
  }

  // Marketing/static pages don't fetch the user's role server-side (that
  // would force auth() and pull the whole page out of static rendering just
  // for a nav label) — they render <Navbar /> with no role prop and this
  // fills it in client-side instead. Pages that already need the user's row
  // for their own logic keep passing role directly, which skips this fetch.
  useEffect(() => {
    if (role !== undefined || fetchedRole !== undefined) return
    let cancelled = false
    async function loadRole() {
      if (!isSignedIn) { if (!cancelled) setFetchedRole(undefined); return }
      try {
        const res = await fetch("/api/onboarding-status")
        const data = res.ok ? await res.json() : null
        if (!cancelled) setFetchedRole(data?.role)
      } catch {
        // leave fetchedRole as-is — nav just renders without the garage-owner link
      }
    }
    loadRole()
    return () => { cancelled = true }
  }, [role, isSignedIn, fetchedRole])

  const effectiveRole = role ?? fetchedRole

  // Only mount UserButton on desktop — prevents Clerk rendering a floating
  // avatar when nav-desktop is CSS-hidden on mobile.
  const isDesktop = useSyncExternalStore(subscribeToDesktopQuery, getIsDesktopSnapshot, getIsDesktopServerSnapshot)

  // The mobile menu is a native modal <dialog>. showModal() puts it in the
  // browser's top layer and makes the rest of the page inert, so a tap on the
  // menu can never fall through to whatever is underneath (e.g. a garage card
  // on the homepage) — the bug iOS Safari had with the old fixed-position div.
  // It also gives Escape-to-close and focus trapping for free.
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (menuOpen && !dialog.open) dialog.showModal()
    if (!menuOpen && dialog.open) dialog.close()
  }, [menuOpen])

  // If the viewport widens to desktop (e.g. rotating a tablet) while the menu
  // is open, close it — otherwise the page would stay inert behind a menu that
  // no longer makes sense. Same adjust-state-during-render pattern as above.
  if (menuOpen && isDesktop) setMenuOpen(false)

  const isGarageOwner = effectiveRole === "garage_owner"
  const onGarages = pathname === "/for-garages"
  const onDrivers = pathname === "/for-drivers"

  // Plain nav links mark the current page with darker, bolder text (not a
  // background) so a "selected" grey pill only ever appears in the
  // logged-out segmented control below, where it means "you are here".
  const linkProps = (href: string) => {
    const active = pathname === href
    return {
      href,
      className: "nav-link",
      "aria-current": active ? ("page" as const) : undefined,
      style: active ? { ...navLink, color: "#111110", fontWeight: 600 } : navLink,
    }
  }

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
            <Link {...linkProps("/")}>Home</Link>
            {/* The public directory is for drivers — a garage owner has no
                reason to browse a list of their competitors. */}
            {!isGarageOwner && <Link {...linkProps("/garages")}>Garages</Link>}
            {isSignedIn && (isGarageOwner
              ? <Link {...linkProps("/garage-dashboard")}>Dashboard</Link>
              : <>
                  <Link {...linkProps("/bookings")}>My Bookings</Link>
                  <Link {...linkProps("/vehicles")}>My Vehicles</Link>
                </>
            )}
            {/* Signed in, the segmented control would hold only one or two
                items — a lone "Pricing" inside a grey pill looks permanently
                selected. So signed-in users get these as ordinary links. */}
            {isSignedIn && !isGarageOwner && <Link {...linkProps("/for-drivers")}>For drivers</Link>}
            {isSignedIn && <Link {...linkProps("/pricing")}>Pricing</Link>}
          </div>
          {/* Logged out: segmented "who are you?" control. It always holds
              all three options, so the grey track reads as a toggle rather
              than as one item being selected. */}
          {!isSignedIn && (
            <>
              <div style={{ width: "0.5px", height: 18, background: "rgba(0,0,0,0.15)" }} />
              <div style={{ background: "#f4f3ef", borderRadius: 100, padding: 3, display: "flex", gap: 2 }}>
                {[
                  { href: "/for-garages", label: "For garages", active: onGarages },
                  { href: "/for-drivers", label: "For drivers", active: onDrivers },
                  { href: "/pricing", label: "Pricing", active: pathname === "/pricing" },
                ].map(({ href, label, active }) => (
                  <Link key={href} href={href} aria-current={active ? "page" : undefined} style={{
                    padding: "5px 14px", borderRadius: 100, fontSize: "0.82rem", fontWeight: 600,
                    textDecoration: "none",
                    background: active ? "#111110" : "transparent",
                    color: active ? "#ffffff" : "#444441",
                  }}>{label}</Link>
                ))}
              </div>
            </>
          )}
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
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: -12 }}
        >
          <HamburgerIcon open={false} />
        </button>
      </nav>

      {/* Mobile menu — native modal dialog (see dialogRef comment above).
          Always rendered so the ref exists; the browser hides it until
          showModal(). Layout and scroll-lock rules live in globals.css. */}
      <dialog
        ref={dialogRef}
        id="mobile-menu"
        className="mobile-menu"
        aria-label="Menu"
        // Fires on Escape / Android back as well as our own close() — keeps
        // React state in step with the browser.
        onClose={() => setMenuOpen(false)}
        // Close as soon as a link is tapped (instant feedback, and it closes
        // even when tapping the page you're already on). Buttons that open
        // Clerk's sign-in/sign-up/sign-out flows are marked data-close-menu,
        // because Clerk renders those outside the dialog.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a, [data-close-menu]")) setMenuOpen(false)
        }}
      >
        {/* The page's own navbar is inert while the dialog is open, so the
            dialog carries its own copy of the bar with a close button. */}
        <div className="mobile-menu-bar" style={{
          height: 56, flexShrink: 0, padding: "0 28px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "0.5px solid rgba(0,0,0,0.12)",
          position: "sticky", top: 0, background: "#ffffff", zIndex: 1,
        }}>
          <FycaLogo />
          <button
            autoFocus
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: -12 }}
          >
            <HamburgerIcon open />
          </button>
        </div>

        <div style={{ padding: "8px 0 40px" }}>
          {/* Primary links */}
          <div style={{ padding: "8px 16px" }}>
            <Link href="/" className="mobile-link" style={mobileLink}>Home</Link>
            {!isGarageOwner && <Link href="/garages" className="mobile-link" style={mobileLink}>Garages</Link>}
            {isSignedIn && (isGarageOwner
              ? <Link href="/garage-dashboard" className="mobile-link" style={mobileLink}>Dashboard</Link>
              : <>
                  <Link href="/bookings" className="mobile-link" style={mobileLink}>My Bookings</Link>
                  <Link href="/vehicles" className="mobile-link" style={mobileLink}>My Vehicles</Link>
                </>
            )}
          </div>

          <div style={{ height: "0.5px", background: "rgba(0,0,0,0.08)", margin: "8px 16px" }} />

          {/* Platform — same list as the footer. "Find a garage" is skipped
              because the primary links above already show it as "Garages". */}
          <div style={{ padding: "8px 16px" }}>
            <p style={menuEyebrow}>Platform</p>
            {PLATFORM_LINKS.filter(l => l.href !== "/garages").map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="mobile-link"
                aria-current={pathname === href ? "page" : undefined}
                style={{ ...mobileLink, background: pathname === href ? "#f4f3ef" : "transparent" }}
              >
                {label}
              </Link>
            ))}
          </div>

          <div style={{ height: "0.5px", background: "rgba(0,0,0,0.08)", margin: "8px 16px" }} />

          {/* Auth */}
          <div style={{ padding: "16px 16px 0" }}>
            {!isSignedIn ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <SignInButton mode="modal">
                  <button data-close-menu style={{ width: "100%", background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", borderRadius: 100, padding: "13px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button data-close-menu style={{ width: "100%", background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "13px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Get started
                  </button>
                </SignUpButton>
              </div>
            ) : (
              // Plain link + sign-out button rather than Clerk's <UserButton>:
              // its popover renders outside this dialog, where the modal would
              // make it inert and untappable.
              <div>
                <Link href="/profile" className="mobile-link" style={mobileLink}>My profile</Link>
                <SignOutButton>
                  <button data-close-menu className="mobile-link" style={{ ...mobileLink, width: "100%", textAlign: "left", background: "transparent", border: "none", cursor: "pointer", color: "#6b6a66" }}>
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            )}
          </div>

          {/* Company — the menu's "footer". Placed after the auth buttons so
              Log in / Get started stay near the top of the screen, and styled
              smaller in a 2-column grid because these are low-priority links. */}
          <div style={{ padding: "24px 16px 0", marginTop: 16, borderTop: "0.5px solid rgba(0,0,0,0.08)" }}>
            <p style={menuEyebrow}>Company</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {COMPANY_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="mobile-link"
                  aria-current={pathname === href ? "page" : undefined}
                  style={{
                    ...mobileLink,
                    fontSize: "0.9rem",
                    color: pathname === href ? "#111110" : "#6b6a66",
                    background: pathname === href ? "#f4f3ef" : "transparent",
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </dialog>
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

const menuEyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
  color: "#aaa9a4", margin: "4px 14px 6px", fontFamily: "var(--font-dm-sans), sans-serif",
}

const mobileLink: React.CSSProperties = {
  display: "block", padding: "12px 14px", borderRadius: 10,
  fontSize: "1rem", fontWeight: 500, color: "#111110",
  textDecoration: "none", fontFamily: "var(--font-dm-sans), sans-serif",
}
