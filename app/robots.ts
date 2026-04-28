import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_ENV !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/garage-dashboard", "/bookings", "/onboarding", "/api/"],
    },
    sitemap: "https://fyca.co.uk/sitemap.xml",
  }
}
