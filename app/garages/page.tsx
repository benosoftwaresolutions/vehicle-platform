import Navbar from "../components/Navbar"
import GaragesSearch from "./GaragesSearch"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "../lib/prisma"

export default async function Garages() {
  const { userId } = await auth()

  const [user, garages, reviewCounts] = await Promise.all([
    userId
      ? prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } })
      : null,
    prisma.garage.findMany({ orderBy: { name: "asc" } }),
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
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Find a Garage</h1>
        <p className="text-gray-500 mb-8">Search for a garage near you</p>
        <GaragesSearch garages={garagesWithCounts} allServices={allServices} />
      </main>
    </>
  )
}
