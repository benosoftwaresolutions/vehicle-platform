import type { MetadataRoute } from "next"
import { prisma } from "@/app/lib/prisma"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fyca.co.uk"

  const garages = await prisma.garage.findMany({
    where: { approved: true },
    select: { id: true, updatedAt: true },
  })

  const garageUrls: MetadataRoute.Sitemap = garages.map((g) => ({
    url: `${base}/garages/${g.id}`,
    lastModified: g.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [
    { url: base,                         lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/garages`,            lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/pricing`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/for-garages`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/for-drivers`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/about`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/privacy`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    ...garageUrls,
  ]
}
