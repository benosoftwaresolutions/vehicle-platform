import type { MetadataRoute } from "next"
import { prisma } from "@/app/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dryvn.co.uk"

  const garages = await prisma.garage.findMany({ select: { id: true, updatedAt: true } })

  const garageUrls: MetadataRoute.Sitemap = garages.map((g) => ({
    url: `${base}/garages/${g.id}`,
    lastModified: g.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/garages`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/for-garages`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/for-drivers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...garageUrls,
  ]
}
