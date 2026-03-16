import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { redirect } from "next/navigation"
import Navbar from "@/app/components/Navbar"
import AvailabilityForm from "@/app/components/AvailabilityForm"

export default async function AvailabilityPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user || user.role !== "garage_owner") redirect("/")

  const availability = await prisma.garageAvailability.findUnique({
    where: { garageId: user.garageId! },
    include: { schedule: true }
  })

  return (
    <>
      <Navbar />
      <div style={{background: "#f8f9fb", minHeight: "100vh"}}>
        <div style={{background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "48px 32px"}}>
          <div className="max-w-5xl mx-auto">
            <h1 style={{color: "white", fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem"}}>Availability Settings</h1>
            <p style={{color: "#94a3b8", fontSize: "1.1rem"}}>Set your opening hours and booking capacity for each day</p>
          </div>
        </div>
        <main className="max-w-3xl mx-auto px-8 py-12">
          <AvailabilityForm
            garageId={user.garageId!}
            existing={availability}
          />
        </main>
      </div>
    </>
  )
}