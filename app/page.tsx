import MarketingHome from "./components/MarketingHome"
import { pageMetadata } from "./lib/seo"

export const metadata = pageMetadata({
  description: "Find and book a trusted local garage in seconds. Search by service, read reviews, and confirm your slot — all online.",
  path: "/",
})

// "/" is now STATIC: built once, served from Vercel's CDN, and rebuilt in the
// background at most once a minute (same freshness as the garage cache).
// Nothing here reads cookies or calls auth() — that is what lets Next.js
// pre-render it. Signed-in visitors never see this file: middleware.ts
// rewrites their "/" request to /home, which renders their personal view.
export const revalidate = 60

export default function Home() {
  return <MarketingHome />
}
