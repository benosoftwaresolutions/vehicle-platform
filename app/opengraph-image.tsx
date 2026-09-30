import { ImageResponse } from "next/og"
import { loadOgFonts, OG_SIZE, OG_CONTENT_TYPE, SiteOgCard } from "@/app/lib/og"

// File convention: Next.js turns this into og:image (and, because X falls back
// to og:image, the X/Twitter card image) for every route that doesn't have a
// closer opengraph-image file of its own.
export const alt = "Fyca — book a trusted local garage in seconds"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return new ImageResponse(<SiteOgCard />, { ...size, fonts: await loadOgFonts() })
}
