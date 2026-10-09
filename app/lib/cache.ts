import { unstable_cache } from "next/cache"
import { prisma } from "./prisma"
import { activeGarageWhere } from "./subscription"

// Cached per-user profile — avoids a DB call on every page just for the Navbar role.
// Cache is invalidated via updateTag(`user-${clerkId}`) when the role changes.
export function getCachedUser(clerkId: string) {
  return unstable_cache(
    () => prisma.user.findUnique({
      where: { clerkId },
      select: { role: true, profileComplete: true, name: true, garageId: true },
    }),
    [`user-${clerkId}`],
    { revalidate: 300, tags: [`user-${clerkId}`] }
  )()
}

// Shared approved-garage list with review counts — cached 60 s and tag-invalidated
// when admin approves or deletes a garage. Each page sorts in memory.
export const getCachedGarages = unstable_cache(
  async () => {
    const [garages, reviewCounts] = await Promise.all([
      prisma.garage.findMany({ where: { approved: true, ...activeGarageWhere() } }),
      prisma.review.groupBy({ by: ["garageId"], _count: { id: true } }),
    ])
    const reviewCountMap = Object.fromEntries(reviewCounts.map(r => [r.garageId, r._count.id]))
    return { garages, reviewCountMap }
  },
  ["garages-approved"],
  { revalidate: 60, tags: ["garages"] }
)

// Homepage "What drivers say" — recent 4★+ reviews. Logged-out visitors are
// most of the homepage's traffic, so caching this saves a DB round trip on
// almost every hit. Only plain strings/numbers are selected: unstable_cache
// stores results as JSON, which would turn Date fields into strings.
// Tagged "garages" so the admin actions that already call
// updateTag("garages") (e.g. deleting a review) clear it straight away.
export const getCachedTopReviews = unstable_cache(
  () => prisma.review.findMany({
    where: { rating: { gte: 4 }, comment: { not: "" } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, customerName: true, rating: true, comment: true, garageId: true },
  }),
  ["top-reviews"],
  { revalidate: 300, tags: ["garages", "reviews"] }
)
