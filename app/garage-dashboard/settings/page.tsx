import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import Navbar from "@/app/components/Navbar"
import Link from "next/link"
import GarageSettingsForm from "./GarageSettingsForm"

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

function SetupRequired() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", marginBottom: 12 }}>Setup required</h1>
        <Link href="/onboarding" style={{ color: "#6b6a66", textDecoration: "none" }}>Complete setup</Link>
      </div>
    </div>
  )
}

export default async function GarageSettingsPage() {
  const { userId } = await auth()
  if (!userId) return <NotAuthorized />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, garageId: true },
  })

  if (!user || user.role !== "garage_owner") return <NotAuthorized />
  if (!user.garageId) return <SetupRequired />

  const garage = await prisma.garage.findUnique({
    where: { id: user.garageId },
    select: { name: true, email: true, phone: true, address: true, city: true, postcode: true, description: true, services: true, specialistMakes: true, logoUrl: true },
  })

  if (!garage) return <NotAuthorized />

  return (
    <>
      <Navbar role="garage_owner" />
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b6a66", marginBottom: "14px" }}>
            <Link href="/garage-dashboard" style={{ color: "#6b6a66", textDecoration: "none" }}>Dashboard</Link>
            <span style={{ margin: "0 6px" }}>→</span>
            Settings
          </p>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px" }}>
            Business Profile
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Manage how your garage appears to customers</p>
        </div>
      </div>
      <main className="page-body" style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 32px" }}>
        <GarageSettingsForm garage={garage} />
      </main>
    </>
  )
}
