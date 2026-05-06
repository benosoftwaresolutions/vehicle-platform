import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { cache } from "react"
import Navbar from "@/app/components/Navbar"
import Link from "next/link"

// Deduplicates across layout + page in the same request
export const getGarageOwnerContext = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, garageId: true },
  })
  if (!user || user.role !== "garage_owner") return null

  const garage = user.garageId
    ? await prisma.garage.findUnique({
        where: { id: user.garageId },
        select: { approved: true },
      })
    : null

  return { garageId: user.garageId, approved: garage?.approved ?? false }
})

function NotAuthorized() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", marginBottom: 12 }}>Not authorised</h1>
        <Link href="/" style={{ color: "#6b6a66", textDecoration: "none" }}>Go home</Link>
      </div>
    </div>
  )
}

function SetupPrompt() {
  return (
    <>
      <Navbar role="garage_owner" />
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center", maxWidth: "480px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.4rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "10px" }}>
            Set up your garage
          </h2>
          <p style={{ color: "#6b6a66", marginBottom: "28px", lineHeight: 1.6, fontSize: "0.95rem" }}>
            You haven&apos;t added your garage details yet. Complete the setup to start accepting bookings from customers.
          </p>
          <Link
            href="/onboarding"
            style={{ background: "#111110", color: "#ffffff", padding: "12px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}
          >
            Complete setup
          </Link>
        </div>
      </main>
    </>
  )
}

function PendingApprovalBanner() {
  return (
    <div style={{
      background: "#fffbeb",
      borderBottom: "0.5px solid rgba(234,179,8,0.3)",
      padding: "12px 32px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1rem" }}>⏳</span>
          <div>
            <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#92400e", margin: 0 }}>
              Your garage is pending approval
            </p>
            <p style={{ fontSize: "0.8rem", color: "#a16207", margin: 0 }}>
              It won&apos;t appear in search results until an admin approves your listing. This usually takes 1–2 business days.
            </p>
          </div>
        </div>
        <Link
          href="/garage-dashboard/settings"
          style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400e", textDecoration: "underline", whiteSpace: "nowrap" }}
        >
          Review your listing →
        </Link>
      </div>
    </div>
  )
}

export default async function GarageDashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) return <NotAuthorized />

  const ctx = await getGarageOwnerContext(userId)
  if (!ctx) return <NotAuthorized />
  if (!ctx.garageId) return <SetupPrompt />

  return (
    <>
      <Navbar role="garage_owner" />
      {!ctx.approved && <PendingApprovalBanner />}
      {children}
    </>
  )
}
