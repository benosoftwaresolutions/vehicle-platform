"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateGarageSettings(formData: {
  name: string
  email: string
  phone: string
  address: string
  city: string
  postcode: string
  description: string
  services: string[]
  servicePricing: Record<string, { min: number | null; max: number | null }>
  specialistMakes: string[]
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorised")

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { garageId: true, role: true },
  })

  if (!user || user.role !== "garage_owner" || !user.garageId) {
    throw new Error("Unauthorised")
  }

  // Contact details are mandatory at signup, so they can't be cleared here
  // either — the `required` attributes on the form are client-side only.
  const email = formData.email.trim()
  const phone = formData.phone.trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid garage email is required")
  }
  if (phone.length < 7) {
    throw new Error("A valid phone number is required")
  }

  await prisma.garage.update({
    where: { id: user.garageId },
    data: {
      name: formData.name.trim(),
      email,
      phone,
      address: formData.address.trim(),
      city: formData.city.trim(),
      postcode: formData.postcode.trim().toUpperCase(),
      description: formData.description.trim() || null,
      services: formData.services,
      servicePricing: formData.servicePricing,
      specialistMakes: formData.specialistMakes,
    },
  })

  revalidatePath("/garage-dashboard")
  revalidatePath("/garage-dashboard/settings")
  revalidatePath("/garages")
}
