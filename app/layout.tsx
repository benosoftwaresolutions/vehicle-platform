import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import { Fraunces, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import EnvironmentBanner from "./components/EnvironmentBanner"
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

export const metadata: Metadata = {
  title: "Fyca — Fix Your Car Anywhere",
  description: "Find and book a trusted local garage in seconds. Search by service, read reviews, and confirm your slot — all online.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/onboarding" signUpFallbackRedirectUrl="/onboarding">
      <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
        <body>
          <EnvironmentBanner />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
