import Link from "next/link"
import Navbar from "@/app/components/Navbar"
import DryvnFooter from "@/app/components/DryvnFooter"
import GarageSignupForm from "./GarageSignupForm"
import { auth } from "@clerk/nextjs/server"
import { getCachedUser } from "@/app/lib/cache"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "For Garages — Fyca",
  description: "Fill your bay, not your inbox. Fyca lets customers book online 24/7 so you spend less time on the phone and more time doing the work.",
}

// ─── Feature card icons ───────────────────────────────────────────────────────

function IconCalendar() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="3" width="16" height="15" rx="2" stroke="white" strokeWidth="1.6"/>
      <path d="M6 1v4M14 1v4M2 8h16" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
      <rect x="5.5" y="11.5" width="2" height="2" rx="0.5" fill="white"/>
      <rect x="9.5" y="11.5" width="2" height="2" rx="0.5" fill="white"/>
      <rect x="5.5" y="14.5" width="2" height="2" rx="0.5" fill="white"/>
      <rect x="9.5" y="14.5" width="2" height="2" rx="0.5" fill="white"/>
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <path d="M10 2a6 6 0 00-6 6v2.5L2.5 13h15L16 10.5V8a6 6 0 00-6-6z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M8 15a2 2 0 004 0" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M10 2V1" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function IconBadge() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <path d="M10 1.5L2 5v5c0 4.4 3.4 8.1 8 9 4.6-.9 8-4.6 8-9V5L10 1.5z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IconPeople() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <circle cx="7.5" cy="6" r="3" stroke="white" strokeWidth="1.6"/>
      <path d="M1 18v-1a6.5 6.5 0 0113 0v1" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M15 9a3 3 0 100-6M18 18v-1a5 5 0 00-3-4.7" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function IconTool() {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <path d="M15.5 3.5a4 4 0 00-5.3 5.6L3.5 15.7a1.5 1.5 0 002.1 2.1l6.6-6.7A4 4 0 0015.5 3.5z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 6l1.5 1.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  )
}

function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10, background: "#111110",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, marginBottom: 16,
    }}>
      {children}
    </div>
  )
}

const FEATURES = [
  {
    icon: <IconCalendar />,
    title: "Online booking",
    body: "Customers book directly from your listing page — any time, any device. No calls, no back-and-forth, no missed enquiries.",
  },
  {
    icon: <IconBell />,
    title: "Instant notifications",
    body: "Get an email the moment a customer books. Accept or decline with a single click, and they're notified straight away.",
  },
  {
    icon: <IconBadge />,
    title: "Your brand, your profile",
    body: "Upload your logo, write your description, list your specialist makes. Your public listing looks professional from day one.",
  },
  {
    icon: <IconPeople />,
    title: "Walk-in support",
    body: "Create bookings for customers who walk in off the street. Everything tracked in one place — online and walk-in alike.",
  },
  {
    icon: <IconTool />,
    title: "Built for the real world",
    body: "Set your opening hours, slot durations and daily capacity. Fyca only shows availability that actually works for your schedule.",
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ForGaragesPage() {
  const { userId } = await auth()
  const user = userId ? await getCachedUser(userId) : null

  return (
    <>
      <Navbar role={user?.role} />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="sect-hero" style={{ padding: "96px 24px 80px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <p className="eyebrow" style={{ marginBottom: 20 }}>For garage owners</p>

          <h1 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(40px, 6vw, 64px)",
            letterSpacing: "-0.035em", lineHeight: 1.04,
            color: "#111110", marginBottom: 22, maxWidth: 640,
          }}>
            Fill your bay,{" "}
            <em style={{ fontStyle: "italic" }}>not your inbox.</em>
          </h1>

          <p style={{ fontSize: "1.1rem", color: "#6b6a66", marginBottom: 36, maxWidth: 480, lineHeight: 1.65 }}>
            Let customers book online, manage appointments, and keep your diary full — without the back-and-forth.
          </p>

          <div className="cta-row" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 56 }}>
            <Link href="/sign-up" style={{
              background: "#111110", color: "#ffffff",
              padding: "14px 28px", borderRadius: 100,
              fontWeight: 600, fontSize: "0.95rem", textDecoration: "none",
            }}>
              List your garage free
            </Link>
            <a href="#features" style={{
              background: "transparent", color: "#111110",
              padding: "14px 28px", borderRadius: 100,
              fontWeight: 600, fontSize: "0.95rem", textDecoration: "none",
              border: "0.5px solid rgba(0,0,0,0.20)",
            }}>
              See how it works
            </a>
          </div>

          {/* Stats strip */}
          <div className="stats-strip" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            background: "#f4f3ef", borderRadius: 14,
            overflow: "hidden",
          }}>
            {[
              { value: "3 min", label: "To get listed" },
              { value: "24/7",  label: "Bookings while you sleep" },
              { value: "Zero",  label: "Phone time" },
            ].map(({ value, label }, i) => (
              <div key={label} style={{
                padding: "22px 24px",
                borderRight: i < 2 ? "0.5px solid rgba(0,0,0,0.10)" : "none",
              }}>
                <p style={{
                  fontFamily: "var(--font-fraunces),'Fraunces',serif",
                  fontWeight: 600, fontSize: "1.6rem",
                  letterSpacing: "-0.03em", color: "#111110",
                  marginBottom: 4, lineHeight: 1,
                }}>{value}</p>
                <p style={{ fontSize: "0.82rem", color: "#6b6a66", margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────────────── */}
      <section id="features" style={{ padding: "72px 24px", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <p className="eyebrow" style={{ marginBottom: 14 }}>What you get</p>
          <h2 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(26px, 3.5vw, 34px)",
            letterSpacing: "-0.025em", color: "#111110", marginBottom: 44,
          }}>
            Everything you need to run a modern garage
          </h2>

          {/* 2-col grid, last card full-width */}
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {FEATURES.slice(0, 4).map((f) => (
              <div key={f.title} style={{
                background: "#ffffff", borderRadius: 14, padding: "26px 24px",
                border: "0.5px solid rgba(0,0,0,0.06)",
              }}>
                <FeatureIcon>{f.icon}</FeatureIcon>
                <h3 style={{
                  fontFamily: "var(--font-fraunces),'Fraunces',serif",
                  fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em",
                  color: "#111110", marginBottom: 10,
                }}>{f.title}</h3>
                <p style={{ color: "#444441", fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>{f.body}</p>
              </div>
            ))}

            {/* Last card — full width */}
            <div style={{
              gridColumn: "span 2",
              background: "#ffffff", borderRadius: 14, padding: "26px 24px",
              border: "0.5px solid rgba(0,0,0,0.06)",
              display: "flex", gap: 28, alignItems: "flex-start",
            }}>
              <FeatureIcon>{FEATURES[4].icon}</FeatureIcon>
              <div>
                <h3 style={{
                  fontFamily: "var(--font-fraunces),'Fraunces',serif",
                  fontWeight: 600, fontSize: "1.05rem", letterSpacing: "-0.02em",
                  color: "#111110", marginBottom: 10,
                }}>{FEATURES[4].title}</h3>
                <p style={{ color: "#444441", fontSize: "0.9rem", lineHeight: 1.65, margin: 0, maxWidth: 600 }}>
                  {FEATURES[4].body}
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Testimonial ───────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{
            background: "#111110", borderRadius: 20, padding: "48px 52px",
            display: "flex", flexDirection: "column", gap: 28,
          }}>
            <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
              <path d="M0 24V14C0 6.268 4.477 1.928 13.43 1L14.5 3.8C10.5 4.8 8.167 7.133 7.5 10.5H13V24H0zm18 0V14c0-7.732 4.477-12.072 13.43-13L32.5 3.8C28.5 4.8 26.167 7.133 25.5 10.5H31V24H18z" fill="rgba(255,255,255,0.15)"/>
            </svg>

            <p style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 500, fontSize: "clamp(18px, 2.5vw, 24px)",
              color: "#ffffff", lineHeight: 1.45, letterSpacing: "-0.02em",
              fontStyle: "italic", maxWidth: 640, margin: 0,
            }}>
              "We used to lose bookings every weekend. Now customers book at 11pm and it's waiting for us Monday morning."
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <span style={{
                  fontFamily: "var(--font-fraunces),'Fraunces',serif",
                  fontWeight: 600, fontSize: "0.9rem", color: "#ffffff",
                  letterSpacing: "0.01em",
                }}>MT</span>
              </div>
              <div>
                <p style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.9rem", margin: 0 }}>Mike T.</p>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.82rem", margin: 0 }}>Owner — Thornton Auto, Manchester</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 24px", background: "#f4f3ef" }}>
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
              Ready to get started?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", margin: 0 }}>
              Takes three minutes to set up your profile. No commitment.
            </p>
            <GarageSignupForm />
          </div>
        </div>
      </section>

      <DryvnFooter />
    </>
  )
}
