import { ImageResponse } from "next/og"
import { prisma } from "@/app/lib/prisma"
import { activeGarageWhere } from "@/app/lib/subscription"
import { loadOgFonts, OG_SIZE, OG_CONTENT_TYPE, GarageOgCard, SiteOgCard } from "@/app/lib/og"

// The card people see when a garage sends its Fyca booking link to customers.
// Scoped to /garages/[id], so it overrides the site-wide default image there.

export const alt = "Book this garage online with Fyca"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
// Re-render at most hourly: a renamed garage or new review shows up within the
// hour, without hitting the database every time a link preview is fetched.
export const revalidate = 3600

// Satori can only embed PNG/JPEG, and a slow or broken logo URL must never
// stop the card rendering — so fetch it ourselves, check it, and fall back to
// no logo on any problem.
async function logoAsDataUrl(url: string | null): Promise<string | null> {
  if (!url) return null
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) return null
    const type = res.headers.get("content-type")?.split(";")[0] ?? ""
    if (type !== "image/png" && type !== "image/jpeg") return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.byteLength > 2_000_000) return null
    return `data:${type};base64,${buf.toString("base64")}`
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const fonts = await loadOgFonts()

  // Same visibility rule as the page itself: unapproved or lapsed garages get
  // the generic Fyca card rather than leaking their details.
  const [garage, reviewCount] = await Promise.all([
    prisma.garage.findFirst({
      where: { id, approved: true, ...activeGarageWhere() },
      select: {
        name: true, city: true, postcode: true, services: true,
        specialistMakes: true, rating: true, logoUrl: true,
      },
    }),
    prisma.review.count({ where: { garageId: id } }),
  ])

  if (!garage) {
    return new ImageResponse(<SiteOgCard />, { ...size, fonts })
  }

  return new ImageResponse(
    <GarageOgCard
      g={{
        name: garage.name,
        city: garage.city,
        postcode: garage.postcode,
        services: garage.services,
        specialistMakes: garage.specialistMakes,
        rating: garage.rating,
        reviewCount,
        logoDataUrl: await logoAsDataUrl(garage.logoUrl),
      }}
    />,
    { ...size, fonts },
  )
}
