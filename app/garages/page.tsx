import Navbar from "../components/Navbar"
import DryvnFooter from "../components/DryvnFooter"
import GaragesSearch from "./GaragesSearch"
import OnboardingBanner from "../components/OnboardingBanner"
import { auth } from "@clerk/nextjs/server"
import { getCachedUser, getCachedGarages } from "../lib/cache"

export default async function Garages({ searchParams }: { searchParams: Promise<{ q?: string; service?: string }> }) {
  const { userId } = await auth()
  const params = await searchParams

  const [{ garages, reviewCountMap }, user] = await Promise.all([
    getCachedGarages(),
    userId ? getCachedUser(userId) : null,
  ])

  const garagesWithCounts = [...garages].sort((a, b) => a.name.localeCompare(b.name)).map((g) => ({
    ...g,
    reviewCount: reviewCountMap[g.id] ?? 0,
  }))

  const allServices = Array.from(
    new Set(garages.flatMap((g) => g.services ?? []))
  ).sort()

  const showBanner = !!userId && (!user || !user.profileComplete)

  return (
    <>
      <Navbar role={user?.role} />
      {showBanner && <OnboardingBanner />}
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(30px,4vw,42px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "8px" }}>
            Find a Garage
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Search for a garage near you</p>
        </div>
      </div>
      <main className="page-body" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>
        <GaragesSearch
          key={`${params.q ?? ""}|${params.service ?? ""}`}
          garages={garagesWithCounts}
          allServices={allServices}
          initialSearch={params.q ?? ""}
          initialService={params.service ?? ""}
        />
      </main>
      <DryvnFooter />
    </>
  )
}
