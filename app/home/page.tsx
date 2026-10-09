import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import Navbar from "../components/Navbar"
import FycaFooter from "../components/FycaFooter"
import GarageCard from "../components/GarageCard"
import HomeHeroSearch from "../components/HomeHeroSearch"
import MarketingHome from "../components/MarketingHome"
import GarageOwnerHome from "./GarageOwnerHome"
import { getCachedUser, getCachedGarages } from "../lib/cache"
import { prisma } from "../lib/prisma"
import { pageMetadata } from "../lib/seo"

// Same title/description as "/", and canonical points at "/" so search
// engines treat this as the homepage rather than a separate page.
export const metadata = pageMetadata({
  description: "Find and book a trusted local garage in seconds. Search by service, read reviews, and confirm your slot — all online.",
  path: "/",
})

// The signed-in homepage. Visitors don't come here by URL: middleware.ts
// rewrites "/" to this route when the request carries a Clerk session, so the
// address bar still shows fyca.co.uk/. Keeping the per-user work here is what
// lets the logged-out "/" (app/page.tsx) be a fast static page.
export default async function SignedInHome() {
  const { userId } = await auth()
  if (!userId) redirect("/") // someone typed /home while logged out

  const [{ garages, reviewCountMap }, user] = await Promise.all([
    getCachedGarages(),
    getCachedUser(userId),
  ])

  // Signed up but onboarding unfinished: same marketing page as everyone
  // else, plus the banner nudging them to complete their profile.
  if (!user?.profileComplete) {
    return <MarketingHome role={user?.role} showBanner />
  }

  // Garage owners get their own homepage: what needs attention today and how
  // to get more out of Fyca, rather than a search for other garages.
  if (user.role === "garage_owner") {
    return <GarageOwnerHome userId={userId} firstName={user.name?.split(" ")[0]} />
  }

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

  return (
    <>
      <Navbar role={user.role} />

      {/* Driver hero — search focused */}
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
            <Link href="/bookings" style={pill}>My bookings</Link>
            <Link href="/vehicles" style={pill}>My vehicles</Link>
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

      <FycaFooter />
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
