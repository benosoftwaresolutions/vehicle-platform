import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const body = await req.json()
    const { step, role, name, garageName, garageAddress, garageCity, garagePostcode } = body

    if (step === 1) {
      await prisma.user.update({
        where: { clerkId: userId },
        data: { role, onboardingStep: 1 }
      })
    }

    if (step === 2 && role === "customer") {
      await prisma.user.update({
        where: { clerkId: userId },
        data: { name, onboardingStep: 2, profileComplete: true }
      })
    }

    if (step === 2 && role === "garage_owner") {
      // Create the garage
      const garage = await prisma.garage.create({
        data: {
          name: garageName,
          address: garageAddress,
          city: garageCity,
          postcode: garagePostcode,
          rating: 0,
          services: [],
        }
      })

      // Create default service types for the garage
      await prisma.serviceType.createMany({
        data: [
          { garageId: garage.id, name: "MOT", duration: 60, price: 54.85, description: "Annual MOT test" },
          { garageId: garage.id, name: "Full Service", duration: 180, price: 149.99, description: "Comprehensive vehicle service" },
          { garageId: garage.id, name: "Oil Change", duration: 30, price: 49.99, description: "Engine oil and filter change" },
          { garageId: garage.id, name: "Tyres", duration: 60, price: 0, description: "Tyre fitting and balancing" },
          { garageId: garage.id, name: "Brakes", duration: 90, price: 0, description: "Brake inspection and replacement" },
          { garageId: garage.id, name: "Diagnostics", duration: 60, price: 49.99, description: "Full diagnostic check" },
          { garageId: garage.id, name: "Welding", duration: 120, price: 0, description: "Exhaust and bodywork welding" },
        ]
      })

      // Link garage to user
      await prisma.user.update({
        where: { clerkId: userId },
        data: {
          name,
          role: "garage_owner",
          garageId: garage.id,
          onboardingStep: 2,
          profileComplete: true,
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}