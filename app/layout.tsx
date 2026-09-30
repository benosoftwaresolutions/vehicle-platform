import AuthProvider from "./components/AuthProvider"
import type { Metadata } from "next"
import { Fraunces, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import EnvironmentBanner from "./components/EnvironmentBanner"
import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "./lib/seo"
import "./globals.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
})

// Site-wide defaults. metadataBase turns relative URLs (canonical, og:url,
// og:image) into absolute https://fyca.co.uk/... ones, which crawlers require.
// No canonical here on purpose: metadata is inherited, so a canonical in the
// layout would tell Google every page is a copy of the homepage.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TAGLINE, template: `%s — ${SITE_NAME}` },
  description: "Find and book a trusted local garage in seconds. Search by service, read reviews, and confirm your slot — all online.",
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: "en_GB", type: "website" },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
        <body>
          <EnvironmentBanner />
          {children}
          <Analytics />
        </body>
      </html>
    </AuthProvider>
  )
}
