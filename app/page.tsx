import Navbar from "./components/Navbar"
import DryvnFooter from "./components/DryvnFooter"
import GarageCard from "./components/GarageCard"
import HomeHeroSearch from "./components/HomeHeroSearch"
import OnboardingBanner from "./components/OnboardingBanner"
import { prisma } from "./lib/prisma"
import { auth } from "@clerk/nextjs/server"

const PREMIUM_MAKES = new Set(["BMW", "Mercedes", "Audi", "Volkswagen", "Porsche", "Land Rover"])

export default async function Home() {
  const { userId } = await auth()
  const [garages, user, reviewCounts] = await Promise.all([
    prisma.garage.findMany({ where: { approved: true }, orderBy: { rating: "desc" } }),
    userId ? prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true, profileComplete: true } }) : null,
    prisma.review.groupBy({ by: ["garageId"], _count: { id: true } }),
  ])

  const reviewCountMap = Object.fromEntries(reviewCounts.map(r => [r.garageId, r._count.id]))
  const showBanner = !!userId && (!user || !user.profileComplete)
  const featured = garages.slice(0, 3)
  const allMakes = [...new Set(garages.flatMap(g => g.specialistMakes))].sort()

  return (
    <>
      <Navbar role={user?.role} />
      {showBanner && <OnboardingBanner />}

      {/* 1 — Hero */}
      <section style={{ padding: "96px 32px 80px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 20 }}>
            The smarter way to book
          </p>
          <h1 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600,
            fontSize: "clamp(38px,5.5vw,62px)",
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            color: "#111110",
            marginBottom: 24,
            maxWidth: 660,
          }}>
            Your garage,{" "}
            <em style={{ fontStyle: "italic", color: "#6b6a66" }}>booked in minutes.</em>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#6b6a66", marginBottom: 40, maxWidth: 460, lineHeight: 1.7 }}>
            Find a trusted local garage and book online — any time of day, no phone calls needed.
          </p>
          <HomeHeroSearch />
        </div>
      </section>

      {/* 2 — Trust strip */}
      <section style={{ background: "#f4f3ef", borderBottom: "0.5px solid rgba(0,0,0,0.06)", padding: "14px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#444441" }}>Vetted garages</span>
          <span style={{ color: "rgba(0,0,0,0.2)", fontSize: "0.75rem" }}>·</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#444441" }}>Instant online booking</span>
          <span style={{ color: "rgba(0,0,0,0.2)", fontSize: "0.75rem" }}>·</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#444441" }}>Confirmed by email</span>
        </div>
      </section>

      {/* 3 — How it works */}
      <section style={{ padding: "80px 32px", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 14 }}>How it works</p>
          <h2 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(24px,3vw,34px)",
            letterSpacing: "-0.025em", color: "#111110", marginBottom: 52,
          }}>
            Three steps to sorted
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { n: "1", title: "Search", body: "Enter your location and the service you need. Filter by make, service type, or browse all." },
              { n: "2", title: "Book", body: "Pick a garage, choose a time that works for you, and confirm in seconds — no account needed." },
              { n: "3", title: "Done", body: "Get a confirmation email and turn up at your chosen time. The garage is expecting you." },
            ].map(({ n, title, body }) => (
              <div key={n} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "#111110", color: "#ffffff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-fraunces),'Fraunces',serif",
                  fontWeight: 700, fontSize: "0.95rem",
                  flexShrink: 0,
                }}>{n}</div>
                <div>
                  <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", marginBottom: 8 }}>{title}</p>
                  <p style={{ fontSize: "0.9rem", color: "#444441", lineHeight: 1.7, margin: 0 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Featured garages */}
      {featured.length > 0 && (
        <section style={{ padding: "72px 32px", background: "#f4f3ef" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 14 }}>Featured garages</p>
            <h2 style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600, fontSize: "clamp(24px,3vw,34px)",
              letterSpacing: "-0.025em", color: "#111110", marginBottom: 32,
            }}>
              Trusted garages near you
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {featured.map(garage => (
                <GarageCard
                  key={garage.id}
                  id={garage.id}
                  name={garage.name}
                  location={`${garage.city}, ${garage.postcode}`}
                  rating={garage.rating.toString()}
                  reviewCount={reviewCountMap[garage.id] ?? 0}
                  services={garage.services.join(", ")}
                  logoUrl={garage.logoUrl}
                />
              ))}
            </div>
            <div style={{ marginTop: 28, textAlign: "center" }}>
              <a href="/garages" style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111110", textDecoration: "none", borderBottom: "0.5px solid rgba(0,0,0,0.3)", paddingBottom: 1 }}>
                View all garages →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 5 — Specialist makes */}
      {allMakes.length > 0 && (
        <section style={{ padding: "72px 32px", background: "#ffffff" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 14 }}>Specialist garages</p>
            <h2 style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600, fontSize: "clamp(24px,3vw,34px)",
              letterSpacing: "-0.025em", color: "#111110", marginBottom: 28,
            }}>
              Find a specialist for your make
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allMakes.map(make => {
                const isPremium = PREMIUM_MAKES.has(make)
                return (
                  <a
                    key={make}
                    href={`/garages?q=${encodeURIComponent(make)}`}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 100,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      background: isPremium ? "#111110" : "transparent",
                      color: isPremium ? "#ffffff" : "#111110",
                      border: isPremium ? "none" : "0.5px solid rgba(0,0,0,0.25)",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {make}
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6 — Split pitch */}
      <section style={{ padding: "72px 32px", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }}>

          {/* Drivers */}
          <div style={{ background: "#111110", borderRadius: 20, padding: "44px 40px", display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>For drivers</p>
            <h3 style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600, fontSize: "1.5rem",
              letterSpacing: "-0.025em", color: "#ffffff", marginBottom: 16, lineHeight: 1.2,
            }}>
              Skip the phone calls
            </h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 28 }}>
              Search vetted garages, read real reviews, check live availability, and book in seconds — any time of day.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {["Real reviews from real customers", "Live availability — no waiting on hold", "Email confirmation every time"].map(point => (
                <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginTop: 2 }}>✓</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>{point}</span>
                </div>
              ))}
            </div>
            <a href="/garages" style={{ marginTop: "auto", display: "inline-block", background: "#ffffff", color: "#111110", padding: "12px 24px", borderRadius: 100, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", alignSelf: "flex-start" }}>
              Find a garage
            </a>
          </div>

          {/* Garages */}
          <div style={{ background: "#ffffff", borderRadius: 20, padding: "44px 40px", display: "flex", flexDirection: "column", border: "0.5px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 16 }}>For garages</p>
            <h3 style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600, fontSize: "1.5rem",
              letterSpacing: "-0.025em", color: "#111110", marginBottom: 16, lineHeight: 1.2,
            }}>
              Fill your diary online
            </h3>
            <p style={{ color: "#6b6a66", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 28 }}>
              Accept bookings 24/7 without answering the phone. Manage your schedule, keep customers informed, and grow your business.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {["Free to list your garage", "Online booking management", "Automatic customer notifications"].map(point => (
                <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "rgba(0,0,0,0.25)", fontSize: "0.75rem", marginTop: 2 }}>✓</span>
                  <span style={{ color: "#444441", fontSize: "0.875rem" }}>{point}</span>
                </div>
              ))}
            </div>
            <a href="/for-garages" style={{ marginTop: "auto", display: "inline-block", background: "#111110", color: "#ffffff", padding: "12px 24px", borderRadius: 100, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", alignSelf: "flex-start" }}>
              List your garage
            </a>
          </div>

        </div>
      </section>

      {/* 7 — CTA band */}
      <section style={{ padding: "80px 32px", background: "#111110" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(26px,4vw,42px)",
            letterSpacing: "-0.025em", color: "#ffffff", marginBottom: 14,
          }}>
            Ready to get started?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem", marginBottom: 36 }}>
            Find a garage near you, or list yours for free in minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/garages" style={{ background: "#ffffff", color: "#111110", padding: "14px 30px", borderRadius: 100, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              Find a garage
            </a>
            <a href="/for-garages" style={{ background: "transparent", color: "#ffffff", padding: "14px 30px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", border: "0.5px solid rgba(255,255,255,0.3)" }}>
              List your garage
            </a>
          </div>
        </div>
      </section>

      <DryvnFooter />
    </>
  )
}
