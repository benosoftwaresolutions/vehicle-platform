import Link from "next/link"
import Navbar from "@/app/components/Navbar"
import DryvnFooter from "@/app/components/DryvnFooter"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "For Drivers — dryvn",
  description: "Find and book a trusted garage in seconds. Search by service, read reviews, and confirm your slot — all online.",
}

// ─── Search bar mockup ────────────────────────────────────────────────────────

const MOCK_GARAGES = [
  {
    initials: "CA",
    name: "City Auto Centre",
    meta: "MOT · Full Service · Diagnostics",
    location: "Manchester",
    distance: "0.8 mi",
    stars: 4.9,
    reviews: 124,
  },
  {
    initials: "TG",
    name: "Thornton Garage",
    meta: "Tyres · Brakes · Wheel Alignment",
    location: "Salford",
    distance: "1.2 mi",
    stars: 4.7,
    reviews: 88,
  },
  {
    initials: "PM",
    name: "Premier Motors",
    meta: "BMW Specialist · Servicing · Diagnostics",
    location: "Bolton",
    distance: "1.5 mi",
    stars: 4.8,
    reviews: 61,
  },
]

function SearchMockup() {
  return (
    <div style={{
      background: "#ffffff",
      border: "0.5px solid rgba(0,0,0,0.10)",
      borderRadius: 16,
      overflow: "hidden",
      maxWidth: 700,
      margin: "0 auto",
    }}>
      {/* Search input */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "0.5px solid rgba(0,0,0,0.08)",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8.5" cy="8.5" r="5.5" stroke="#6b6a66" strokeWidth="1.6"/>
          <path d="M14 14l3.5 3.5" stroke="#6b6a66" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        <span style={{ color: "#6b6a66", fontSize: "0.9rem" }}>
          Service, location, or specialist make…
        </span>
      </div>

      {/* Garage rows */}
      {MOCK_GARAGES.map((g, i) => (
        <div key={g.name} style={{
          padding: "16px 20px",
          borderBottom: i < MOCK_GARAGES.length - 1 ? "0.5px solid rgba(0,0,0,0.07)" : "none",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: "#111110",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontSize: "0.78rem", fontWeight: 600, color: "#ffffff", letterSpacing: "0.02em",
            }}>{g.initials}</span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111110", margin: "0 0 2px" }}>{g.name}</p>
            <p style={{ fontSize: "0.78rem", color: "#6b6a66", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {g.meta} · {g.location} · {g.distance}
            </p>
          </div>

          {/* Rating */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111110", margin: "0 0 2px" }}>
              ★ {g.stars.toFixed(1)}
            </p>
            <p style={{ fontSize: "0.72rem", color: "#6b6a66", margin: 0 }}>
              {g.reviews} reviews
            </p>
          </div>

          {/* Book button */}
          <div style={{ flexShrink: 0 }}>
            <span style={{
              background: "#111110", color: "#ffffff",
              padding: "6px 14px", borderRadius: 100,
              fontSize: "0.78rem", fontWeight: 600,
              display: "inline-block",
            }}>Book</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── How it works steps ───────────────────────────────────────────────────────

const STEPS = [
  {
    n: "1",
    title: "Search your area",
    body: "Find garages near you by service, specialist make, or rating. Real reviews from real customers.",
  },
  {
    n: "2",
    title: "Pick a slot",
    body: "Choose a time that works from live availability. No more \"give us a call to check.\"",
  },
  {
    n: "3",
    title: "Get confirmed",
    body: "The garage accepts and you get an instant email confirmation. Easy to reschedule if plans change.",
  },
]

// ─── Specialist makes ────────────────────────────────────────────────────────

const FEATURED_MAKES = ["BMW", "Mercedes", "Audi"]
const OTHER_MAKES = ["Volkswagen", "Ford", "Vauxhall", "Toyota", "Honda", "Nissan", "Peugeot", "Renault"]

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ForDriversPage() {
  const { userId } = await auth()
  const user = userId
    ? await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } })
    : null

  return (
    <>
      <Navbar role={user?.role} />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: "96px 24px 72px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <p className="eyebrow" style={{ marginBottom: 20 }}>For drivers</p>

          <h1 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(40px, 6vw, 64px)",
            letterSpacing: "-0.035em", lineHeight: 1.04,
            color: "#111110", marginBottom: 22, maxWidth: 560,
          }}>
            Your garage, booked in seconds.
          </h1>

          <p style={{ fontSize: "1.1rem", color: "#6b6a66", marginBottom: 36, maxWidth: 460, lineHeight: 1.65 }}>
            Find a trusted local garage, pick a time that works, and book online. No phone calls, no waiting on hold.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
            <Link href="/garages" style={{
              background: "#111110", color: "#ffffff",
              padding: "14px 28px", borderRadius: 100,
              fontWeight: 600, fontSize: "0.95rem", textDecoration: "none",
            }}>
              Find a garage
            </Link>
            <a href="#how-it-works" style={{
              background: "transparent", color: "#111110",
              padding: "14px 28px", borderRadius: 100,
              fontWeight: 600, fontSize: "0.95rem", textDecoration: "none",
              border: "0.5px solid rgba(0,0,0,0.20)",
            }}>
              How it works
            </a>
          </div>

          {/* Search bar mockup */}
          <SearchMockup />

        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: "72px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <p className="eyebrow" style={{ marginBottom: 14 }}>How it works</p>
          <h2 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(26px, 3.5vw, 34px)",
            letterSpacing: "-0.025em", color: "#111110", marginBottom: 52,
          }}>
            From search to confirmed in minutes
          </h2>

          {/* Vertical step flow */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 560 }}>
            {STEPS.map((step, i) => (
              <div key={step.n} style={{ display: "flex", gap: 24, position: "relative" }}>
                {/* Number + connector line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", background: "#111110",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <span style={{
                      fontFamily: "var(--font-fraunces),'Fraunces',serif",
                      fontWeight: 600, fontSize: "0.95rem", color: "#ffffff",
                    }}>{step.n}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: "0.5px", flex: 1, background: "rgba(0,0,0,0.12)", margin: "6px 0" }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ paddingBottom: i < STEPS.length - 1 ? 40 : 0, paddingTop: 8 }}>
                  <h3 style={{
                    fontFamily: "var(--font-fraunces),'Fraunces',serif",
                    fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em",
                    color: "#111110", marginBottom: 8,
                  }}>{step.title}</h3>
                  <p style={{ color: "#444441", fontSize: "0.95rem", lineHeight: 1.65, margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Specialist makes ──────────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <p className="eyebrow" style={{ marginBottom: 14 }}>Specialist garages for every make</p>
          <h2 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(26px, 3.5vw, 34px)",
            letterSpacing: "-0.025em", color: "#111110", marginBottom: 36,
          }}>
            Find a specialist, not just a garage
          </h2>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {FEATURED_MAKES.map((make) => (
              <Link
                key={make}
                href={`/garages`}
                style={{
                  background: "#111110", color: "#ffffff",
                  padding: "9px 22px", borderRadius: 100,
                  fontWeight: 600, fontSize: "0.9rem",
                  textDecoration: "none",
                }}
              >
                {make}
              </Link>
            ))}
            {OTHER_MAKES.map((make) => (
              <Link
                key={make}
                href="/garages"
                style={{
                  background: "transparent", color: "#444441",
                  padding: "9px 22px", borderRadius: 100,
                  fontWeight: 600, fontSize: "0.9rem",
                  textDecoration: "none",
                  border: "0.5px solid rgba(0,0,0,0.20)",
                }}
              >
                {make}
              </Link>
            ))}
            <span style={{
              padding: "9px 22px", borderRadius: 100,
              fontWeight: 600, fontSize: "0.9rem",
              color: "#6b6a66",
              border: "0.5px solid rgba(0,0,0,0.12)",
            }}>+ more</span>
          </div>

        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{
            background: "#111110", borderRadius: 20, padding: "60px 52px",
            textAlign: "center",
          }}>
            <h2 style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600, fontSize: "clamp(26px, 3.5vw, 36px)",
              letterSpacing: "-0.025em", color: "#ffffff", marginBottom: 12,
            }}>
              Find your garage today
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", marginBottom: 32, margin: "0 auto 32px", maxWidth: 440 }}>
              Trusted local garages. Real reviews, live availability, instant booking.
            </p>
            <Link href="/garages" style={{
              background: "#ffffff", color: "#111110",
              padding: "14px 32px", borderRadius: 100,
              fontWeight: 700, fontSize: "0.95rem",
              textDecoration: "none", display: "inline-block",
            }}>
              Search garages near me
            </Link>
          </div>
        </div>
      </section>

      <DryvnFooter />
    </>
  )
}
