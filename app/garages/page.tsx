import Navbar from "../components/Navbar"
import DryvnFooter from "../components/DryvnFooter"
import GaragesSearch from "./GaragesSearch"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "../lib/prisma"

export default async function Garages({ searchParams }: { searchParams: Promise<{ q?: string; service?: string }> }) {
  const { userId } = await auth()
  const params = await searchParams

  const [user, garages, reviewCounts] = await Promise.all([
    userId
      ? prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } })
      : null,
    prisma.garage.findMany({ where: { approved: true }, orderBy: { name: "asc" } }),
    prisma.review.groupBy({ by: ["garageId"], _count: { id: true } }),
  ])

  const reviewCountMap = Object.fromEntries(reviewCounts.map((r) => [r.garageId, r._count.id]))

  const garagesWithCounts = garages.map((g) => ({
    ...g,
    reviewCount: reviewCountMap[g.id] ?? 0,
  }))

  const allServices = Array.from(
    new Set(garages.flatMap((g) => g.services))
  ).sort()

  return (
    <>
      <Navbar role={user?.role} />
      <div style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(30px,4vw,42px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "8px" }}>
            Find a Garage
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Search for a garage near you</p>
        </div>
      </div>
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>
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
