import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import Navbar from "@/app/components/Navbar"
import Link from "next/link"
import VehicleManager from "./VehicleManager"

export default async function VehiclesPage() {
  const { userId } = await auth()

  if (!userId) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", color: "#111110", marginBottom: 12 }}>Sign in to view your vehicles</h1>
          <Link href="/" style={{ color: "#6b6a66", textDecoration: "none" }}>Go home</Link>
        </div>
      </div>
    )
  }

  const [user, vehicles] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } }),
    prisma.vehicle.findMany({ where: { clerkId: userId }, orderBy: { createdAt: "desc" } }).catch(() => []),
  ])

  return (
    <>
      <Navbar role={user?.role} />
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: 6 }}>
            My Vehicles
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Track MOT dates, service history, and vehicle details</p>
        </div>
      </div>
      <main className="page-body" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 32px" }}>
        <VehicleManager initialVehicles={vehicles.map(v => ({
          ...v,
          motExpiry: v.motExpiry?.toISOString() ?? null,
          lastServiceDate: v.lastServiceDate?.toISOString() ?? null,
          nextServiceDue: v.nextServiceDue?.toISOString() ?? null,
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        }))} />
      </main>
    </>
  )
}
