import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { isGarageAccessAllowed } from "@/app/lib/subscription"
import { redirect } from "next/navigation"
import InsightsView from "./InsightsView"

export default async function InsightsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true } })
  if (!user?.garageId) redirect("/garage-dashboard")

  const garage = await prisma.garage.findUnique({
    where: { id: user.garageId },
    select: { id: true, subscriptionStatus: true, trialEndsAt: true, subscriptionEnd: true },
  })
  if (!garage || !isGarageAccessAllowed(garage)) redirect("/pricing")

  return (
    <>
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: 6 }}>
            AI Insights
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Predictive parts ordering powered by Claude AI</p>
        </div>
      </div>
      <main className="page-body" style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px" }}>
        <InsightsView garageId={garage.id} />
      </main>
    </>
  )
}
