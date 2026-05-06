import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { getGarageOwnerContext } from "../layout"
import AvailabilityForm from "@/app/components/AvailabilityForm"
import Link from "next/link"

export default async function AvailabilityPage() {
  const { userId } = await auth()
  const ctx = await getGarageOwnerContext(userId!)

  const availability = await prisma.garageAvailability.findUnique({
    where: { garageId: ctx!.garageId! },
    include: { schedule: true }
  })

  return (
    <>
      <div style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b6a66", marginBottom: "14px" }}>
            <Link href="/garage-dashboard" style={{ color: "#6b6a66", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ margin: "0 6px" }}>→</span>
            Availability
          </p>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px" }}>
            Availability Settings
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Set your opening hours and booking capacity for each day</p>
        </div>
      </div>
      <main style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 32px" }}>
        <AvailabilityForm
          garageId={ctx!.garageId!}
          existing={availability}
        />
      </main>
    </>
  )
}
