"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateGarageSettings(formData: {
  name: string
  address: string
  city: string
  postcode: string
  description: string
  services: string[]
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

  await prisma.garage.update({
    where: { id: user.garageId },
    data: {
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      postcode: formData.postcode.trim().toUpperCase(),
      description: formData.description.trim() || null,
      services: formData.services,
      specialistMakes: formData.specialistMakes,
    },
  })

  revalidatePath("/garage-dashboard")
  revalidatePath("/garage-dashboard/settings")
  revalidatePath("/garages")
}
