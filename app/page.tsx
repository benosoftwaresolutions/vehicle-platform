import Link from "next/link"
import Navbar from "./components/Navbar"
import DryvnFooter from "./components/DryvnFooter"
import GarageCard from "./components/GarageCard"
import HomeHeroSearch from "./components/HomeHeroSearch"
import OnboardingBanner from "./components/OnboardingBanner"
import { auth } from "@clerk/nextjs/server"
import { getCachedUser, getCachedGarages } from "./lib/cache"
import { prisma } from "./lib/prisma"

const PREMIUM_MAKES = new Set(["BMW", "Mercedes", "Audi", "Volkswagen", "Porsche", "Land Rover"])

export default async function Home() {
  const { userId } = await auth()

  const [{ garages, reviewCountMap }, user] = await Promise.all([
    getCachedGarages(),
    userId ? getCachedUser(userId) : null,
  ])

  return <HomeInner userId={userId} garages={garages} reviewCountMap={reviewCountMap} user={user} />
}

async function HomeInner({
  userId,
  garages,
  reviewCountMap,
  user,
}: {
  userId: string | null
  garages: Awaited<ReturnType<typeof getCachedGarages>>["garages"]
  reviewCountMap: Record<string, number>
  user: Awaited<ReturnType<typeof getCachedUser>> | null
}) {
  const showBanner = !!userId && (!user || !user.profileComplete)

  // ─── Logged-in view ────────────────────────────────────────────────────────
  if (userId && user?.profileComplete) {
    // Find their most recent booking to determine local city
    const recentBooking = await prisma.booking.findFirst({
      where: { clerkId: userId },
      orderBy: { createdAt: "desc" },
      select: { garageId: true },
    })

    const recentGarage = recentBooking
      ? garages.find(g => g.id === recentBooking.garageId)
      : null
    const localCity = recentGarage?.city ?? null

    const localGarages = garages
      .filter(g => !localCity || g.city.toLowerCase() === localCity.toLowerCase())
      .sort((a, b) => b.rating - a.rating)

    // Fall back to all garages by rating if no local ones
    const displayGarages = localGarages.length > 0 ? localGarages : [...garages].sort((a, b) => b.rating - a.rating)
    const isGarageOwner = user.role === "garage_owner"

    return (
      <>
        <Navbar role={user.role} />
        {showBanner && <OnboardingBanner />}

        {/* Logged-in hero — search focused */}
        <section className="sect-hero" style={{ padding: "56px 32px 48px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "#6b6a66", marginBottom: 10 }}>
              Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}
            </p>
            <h1 style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600,
              fontSize: "clamp(28px,4vw,44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#111110",
              marginBottom: 28,
            }}>
              {localCity ? `Garages in ${localCity}` : "Find a garage near you"}
            </h1>
            <HomeHeroSearch />

            {/* Quick links */}
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              {isGarageOwner ? (
                <Link href="/garage-dashboard" style={pill}>Go to dashboard →</Link>
              ) : (
                <>
                  <Link href="/bookings" style={pill}>My bookings</Link>
                  <Link href="/vehicles" style={pill}>My vehicles</Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Local garage grid */}
        <main style={{ padding: "48px 32px", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#111110" }}>
              {localCity ? `Top-rated in ${localCity}` : "Top-rated garages"}
            </h2>
            <Link href="/garages" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#111110", textDecoration: "none", borderBottom: "0.5px solid rgba(0,0,0,0.25)", paddingBottom: 1 }}>
              Browse all →
            </Link>
          </div>

          {displayGarages.length === 0 ? (
            <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center" }}>
              <p style={{ color: "#6b6a66" }}>No garages found yet — <Link href="/garages" style={{ color: "#111110", fontWeight: 600 }}>browse all</Link></p>
            </div>
          ) : (
            <div className="grid-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {displayGarages.slice(0, 9).map(garage => (
                <GarageCard
                  key={garage.id}
                  id={garage.id}
                  name={garage.name}
                  location={`${garage.city}, ${garage.postcode}`}
                  rating={garage.rating.toString()}
                  reviewCount={reviewCountMap[garage.id] ?? 0}
                  services={(garage.services ?? []).join(", ")}
                  logoUrl={garage.logoUrl}
                />
              ))}
            </div>
          )}

          {displayGarages.length > 9 && (
            <div style={{ marginTop: 28, textAlign: "center" }}>
              <Link href="/garages" style={{ background: "#f4f3ef", color: "#111110", padding: "11px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.9rem", textDecoration: "none" }}>
                View all {displayGarages.length} garages →
              </Link>
            </div>
          )}
        </main>

        <DryvnFooter />
      </>
    )
  }

  // ─── Marketing page (logged out) ───────────────────────────────────────────
  const topReviews = await prisma.review.findMany({
    where: { rating: { gte: 4 }, comment: { not: "" } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, customerName: true, rating: true, comment: true, garageId: true },
  })

  const allMakes = [...new Set(garages.flatMap(g => g.specialistMakes ?? []))].sort()

  const seenGarages = new Set<string>()
  const featuredReviews = topReviews.filter(r => {
    if (seenGarages.has(r.garageId)) return false
    seenGarages.add(r.garageId)
    return true
  }).slice(0, 3)
  const garageNameMap = Object.fromEntries(garages.map(g => [g.id, g.name]))

  return (
    <>
      <Navbar role={user?.role} />
      {showBanner && <OnboardingBanner />}

      {/* Hero */}
      <section className="sect-hero" style={{ padding: "96px 32px 80px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
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
            <em className="hero-em" style={{ fontStyle: "italic", color: "#111110", fontWeight: 700 }}>booked in minutes.</em>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#6b6a66", marginBottom: 40, maxWidth: 480, lineHeight: 1.7 }}>
            Find a trusted local garage and book online — any time of day, no phone calls needed.
          </p>
          <HomeHeroSearch />
        </div>
      </section>

      {/* Trust strip */}
      <section style={{ background: "#f4f3ef", borderBottom: "0.5px solid rgba(0,0,0,0.06)", padding: "14px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#444441" }}>Vetted garages</span>
          <span style={{ color: "rgba(0,0,0,0.2)", fontSize: "0.75rem" }}>·</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#444441" }}>Instant online booking</span>
          <span style={{ color: "rgba(0,0,0,0.2)", fontSize: "0.75rem" }}>·</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#444441" }}>Confirmed by email</span>
        </div>
      </section>


      {/* How it works */}
      <section className="sect" style={{ padding: "80px 32px", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 14 }}>How it works</p>
          <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-0.025em", color: "#111110", marginBottom: 52 }}>
            Three steps to sorted
          </h2>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { n: "1", title: "Search", body: "Enter your location and the service you need. Filter by specialist make, service type, or browse all." },
              { n: "2", title: "Book", body: "Pick a garage, choose a time that works for you, and confirm in seconds — no phone call needed." },
              { n: "3", title: "Done", body: "Get a confirmation email and turn up at your chosen time. The garage is expecting you." },
            ].map(({ n, title, body }) => (
              <div key={n} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#111110", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 700, fontSize: "0.95rem", flexShrink: 0 }}>{n}</div>
                <div>
                  <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", marginBottom: 8 }}>{title}</p>
                  <p style={{ fontSize: "0.9rem", color: "#444441", lineHeight: 1.7, margin: 0 }}>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialist makes */}
      {allMakes.length > 0 && (
        <section style={{ padding: "64px 32px", background: "#f4f3ef", borderTop: "0.5px solid rgba(0,0,0,0.06)" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 14 }}>Specialist garages</p>
            <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-0.025em", color: "#111110", marginBottom: 28 }}>
              Find a specialist for your make
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {allMakes.map(make => {
                const isPremium = PREMIUM_MAKES.has(make)
                return (
                  <Link key={make} href={`/garages?q=${encodeURIComponent(make)}`} style={{ padding: "8px 16px", borderRadius: 100, fontSize: "0.85rem", fontWeight: 600, textDecoration: "none", background: isPremium ? "#111110" : "transparent", color: isPremium ? "#ffffff" : "#111110", border: isPremium ? "none" : "0.5px solid rgba(0,0,0,0.25)" }}>
                    {make}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Customer reviews */}
      {featuredReviews.length > 0 && (
        <section className="sect" style={{ padding: "72px 32px", background: "#ffffff" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 14 }}>What drivers say</p>
            <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(24px,3vw,34px)", letterSpacing: "-0.025em", color: "#111110", marginBottom: 36 }}>
              Real reviews from real customers
            </h2>
            <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {featuredReviews.map(review => (
                <div key={review.id} style={{ background: "#f4f3ef", borderRadius: 16, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} style={{ color: s <= review.rating ? "#111110" : "#d1d0cb", fontSize: "0.85rem" }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#444441", lineHeight: 1.65, flex: 1, fontStyle: "italic" }}>
                    &ldquo;{review.comment}&rdquo;
                  </p>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#111110" }}>{review.customerName}</p>
                    {garageNameMap[review.garageId] && (
                      <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginTop: 2 }}>at {garageNameMap[review.garageId]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* For drivers / for garages split */}
      <section className="sect" style={{ padding: "72px 32px", background: "#f4f3ef" }}>
        <div className="grid-2" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "stretch" }}>
          <div style={{ background: "#111110", borderRadius: 20, padding: "44px 40px", display: "flex", flexDirection: "column" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>For drivers</p>
            <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.5rem", letterSpacing: "-0.025em", color: "#ffffff", marginBottom: 16, lineHeight: 1.2 }}>
              Skip the phone calls
            </h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 28 }}>
              Search vetted garages, read real reviews, check live availability, and book in seconds — any time of day.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {["Real reviews from real customers", "Live availability — no waiting on hold", "Email confirmation every time", "MOT and service reminders"].map(point => (
                <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.75rem", marginTop: 2 }}>✓</span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem" }}>{point}</span>
                </div>
              ))}
            </div>
            <Link href="/garages" style={{ marginTop: "auto", display: "inline-block", background: "#ffffff", color: "#111110", padding: "12px 24px", borderRadius: 100, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", alignSelf: "flex-start" }}>
              Find a garage
            </Link>
          </div>

          <div style={{ background: "#ffffff", borderRadius: 20, padding: "44px 40px", display: "flex", flexDirection: "column", border: "0.5px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 16 }}>For garages</p>
            <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.5rem", letterSpacing: "-0.025em", color: "#111110", marginBottom: 16, lineHeight: 1.2 }}>
              Fill your diary online
            </h3>
            <p style={{ color: "#6b6a66", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: 28 }}>
              Accept bookings 24/7 without answering the phone. Manage your schedule, track inventory, and grow your business.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {["Free one-month trial", "Online booking management", "Automatic customer notifications", "AI-powered inventory predictions"].map(point => (
                <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "rgba(0,0,0,0.25)", fontSize: "0.75rem", marginTop: 2 }}>✓</span>
                  <span style={{ color: "#444441", fontSize: "0.875rem" }}>{point}</span>
                </div>
              ))}
            </div>
            <Link href="/for-garages" style={{ marginTop: "auto", display: "inline-block", background: "#111110", color: "#ffffff", padding: "12px 24px", borderRadius: 100, fontWeight: 700, fontSize: "0.875rem", textDecoration: "none", alignSelf: "flex-start" }}>
              List your garage
            </Link>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="sect" style={{ padding: "80px 32px", background: "#111110" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(26px,4vw,42px)", letterSpacing: "-0.025em", color: "#ffffff", marginBottom: 14 }}>
            Ready to get started?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1rem", marginBottom: 36 }}>
            Find a garage near you, or list yours for free in minutes.
          </p>
          <div className="cta-row" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/garages" style={{ background: "#ffffff", color: "#111110", padding: "14px 30px", borderRadius: 100, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
              Find a garage
            </Link>
            <Link href="/for-garages" style={{ background: "transparent", color: "#ffffff", padding: "14px 30px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", border: "0.5px solid rgba(255,255,255,0.3)" }}>
              List your garage
            </Link>
          </div>
        </div>
      </section>

      <DryvnFooter />
    </>
  )
}

const pill: React.CSSProperties = {
  background: "#f4f3ef",
  color: "#111110",
  padding: "8px 18px",
  borderRadius: 100,
  fontWeight: 600,
  fontSize: "0.85rem",
  textDecoration: "none",
  whiteSpace: "nowrap",
}
