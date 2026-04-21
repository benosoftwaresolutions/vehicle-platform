import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import Link from "next/link"
import GarageSettingsForm from "./GarageSettingsForm"

export default async function GarageSettingsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, garageId: true },
  })

  if (!user || user.role !== "garage_owner") redirect("/")
  if (!user.garageId) redirect("/onboarding")

  const garage = await prisma.garage.findUnique({
    where: { id: user.garageId },
    select: { name: true, address: true, city: true, postcode: true, description: true, services: true, specialistMakes: true, logoUrl: true },
  })

  if (!garage) redirect("/")

  return (
    <>
      <Navbar role="garage_owner" />
      <div style={{ background: "#f8f9fb", minHeight: "100vh" }}>
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "48px 32px" }}>
          <div className="max-w-3xl mx-auto">
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              <Link href="/garage-dashboard" style={{ color: "#94a3b8" }}>Dashboard</Link> → Settings
            </p>
            <h1 style={{ color: "white", fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Business Profile</h1>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Manage how your garage appears to customers</p>
          </div>
        </div>
        <main className="max-w-3xl mx-auto px-8 py-10">
          <GarageSettingsForm garage={garage} />
        </main>
      </div>
    </>
  )
}
