import Link from "next/link"
import Navbar from "@/app/components/Navbar"
import FycaFooter from "@/app/components/FycaFooter"
import GarageSearchPreview from "./GarageSearchPreview"
import { auth } from "@clerk/nextjs/server"
import { getCachedUser, getCachedGarages } from "@/app/lib/cache"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "For Drivers — Fyca",
  description: "Find and book a trusted local garage in seconds. Search by service, read reviews, and confirm your slot — all online.",
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ForDriversPage() {
  const { userId } = await auth()
  const [user, { garages, reviewCountMap }] = await Promise.all([
    userId ? getCachedUser(userId) : null,
    getCachedGarages(),
  ])

  const sortedGarages = [...garages].sort((a, b) => b.rating - a.rating)
  const garagesWithCounts = sortedGarages.map(g => ({ ...g, reviewCount: reviewCountMap[g.id] ?? 0 }))

  const liveServices = [...new Set(garages.flatMap(g => g.services ?? []))].slice(0, 8)
  const liveMakes = [...new Set(garages.flatMap(g => g.specialistMakes ?? []))].slice(0, 10)
  const liveCities = [...new Set(garages.map(g => g.city).filter(Boolean))].slice(0, 6)

  return (
    <>
      <Navbar role={user?.role} />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="sect-hero" style={{ padding: "96px 24px 72px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <p className="eyebrow" style={{ marginBottom: 20 }}>For drivers</p>

          <h1 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(40px, 6vw, 64px)",
            letterSpacing: "-0.035em", lineHeight: 1.04,
            color: "#111110", marginBottom: 22, maxWidth: 560,
          }}>
            Your chosen garage, booked in seconds.
          </h1>

          <p style={{ fontSize: "1.1rem", color: "#6b6a66", marginBottom: 36, maxWidth: 460, lineHeight: 1.65 }}>
            Find a trusted local garage, pick a time that works, and book online. No phone calls, no waiting on hold.
          </p>

          <div className="cta-row" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
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

          {/* Live garage search preview */}
          {garagesWithCounts.length > 0 && (
            <GarageSearchPreview garages={garagesWithCounts} />
          )}

        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="sect" style={{ padding: "72px 24px", background: "#ffffff" }}>
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

      {/* ─── Live services & locations ─────────────────────────────────────── */}
      {(liveServices.length > 0 || liveCities.length > 0 || liveMakes.length > 0) && (
        <section className="sect" style={{ padding: "72px 24px", background: "#f4f3ef" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            {liveServices.length > 0 && (
              <>
                <p className="eyebrow" style={{ marginBottom: 14 }}>Services available near you</p>
                <h2 style={{
                  fontFamily: "var(--font-fraunces),'Fraunces',serif",
                  fontWeight: 600, fontSize: "clamp(26px, 3.5vw, 34px)",
                  letterSpacing: "-0.025em", color: "#111110", marginBottom: 24,
                }}>
                  Find exactly what you need
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: liveMakes.length > 0 || liveCities.length > 0 ? 40 : 0 }}>
                  {liveServices.map((s) => (
                    <Link key={s} href="/garages" style={{
                      background: "#111110", color: "#ffffff",
                      padding: "9px 22px", borderRadius: 100,
                      fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
                    }}>{s}</Link>
                  ))}
                </div>
              </>
            )}

            {liveMakes.length > 0 && (
              <>
                <p className="eyebrow" style={{ marginBottom: 14 }}>Specialist makes</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: liveCities.length > 0 ? 40 : 0 }}>
                  {liveMakes.map((make) => (
                    <Link key={make} href="/garages" style={{
                      background: "transparent", color: "#444441",
                      padding: "9px 22px", borderRadius: 100,
                      fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
                      border: "0.5px solid rgba(0,0,0,0.20)",
                    }}>{make}</Link>
                  ))}
                </div>
              </>
            )}

            {liveCities.length > 0 && (
              <>
                <p className="eyebrow" style={{ marginBottom: 14 }}>Locations</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {liveCities.map((city) => (
                    <Link key={city} href="/garages" style={{
                      background: "transparent", color: "#444441",
                      padding: "9px 22px", borderRadius: 100,
                      fontWeight: 600, fontSize: "0.9rem", textDecoration: "none",
                      border: "0.5px solid rgba(0,0,0,0.20)",
                    }}>{city}</Link>
                  ))}
                </div>
              </>
            )}

          </div>
        </section>
      )}

      {/* ─── CTA ───────────────────────────────────────────────────────────── */}
      <section className="sect" style={{ padding: "72px 24px", background: "#ffffff" }}>
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

      <FycaFooter />
    </>
  )
}
