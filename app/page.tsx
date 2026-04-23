import GarageCard from "./components/GarageCard"
import Navbar from "./components/Navbar"
import OnboardingBanner from "./components/OnboardingBanner"
import { prisma } from "./lib/prisma"
import { auth } from "@clerk/nextjs/server"

export default async function Home() {
  const { userId } = await auth()
  const [garages, user, reviewCounts] = await Promise.all([
    prisma.garage.findMany(),
    userId ? prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true, profileComplete: true } }) : null,
    prisma.review.groupBy({ by: ["garageId"], _count: { id: true } }),
  ])
  const reviewCountMap = Object.fromEntries(reviewCounts.map((r) => [r.garageId, r._count.id]))

  const showBanner = !!userId && (!user || !user.profileComplete)

  return (
    <>
      <Navbar role={user?.role} />
      {showBanner && <OnboardingBanner />}

      {/* Hero */}
      <section style={{ padding: "96px 32px 80px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444441", marginBottom: "20px" }}>
            The smarter way to book
          </p>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(38px,5.5vw,56px)", lineHeight: 1.06, letterSpacing: "-0.03em", color: "#111110", marginBottom: "24px", maxWidth: "640px" }}>
            Find and book a garage near you
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#6b6a66", marginBottom: "36px", maxWidth: "420px", lineHeight: 1.6 }}>
            Skip the phone calls. Book your vehicle service online in minutes.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="/garages" style={{ background: "#111110", color: "#ffffff", padding: "14px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}>
              Find a Garage
            </a>
            <a href="/for-drivers" style={{ background: "transparent", color: "#111110", padding: "14px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", border: "0.5px solid rgba(0,0,0,0.2)" }}>
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Featured garages */}
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "64px 32px" }}>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.75rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "6px" }}>
          Featured Garages
        </h2>
        <p style={{ color: "#6b6a66", marginBottom: "32px", fontSize: "0.95rem" }}>Trusted garages available to book today</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garages.map((garage) => (
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
      </main>
    </>
  )
}
