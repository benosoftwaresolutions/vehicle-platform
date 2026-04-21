"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"

async function assertAdmin() {
  const { userId } = await auth()
  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    throw new Error("Unauthorised")
  }
}

export async function deleteGarage(garageId: string) {
  await assertAdmin()

  // Delete all associated records before the garage
  await prisma.$transaction([
    prisma.booking.deleteMany({ where: { garageId } }),
    prisma.review.deleteMany({ where: { garageId } }),
    prisma.serviceType.deleteMany({ where: { garageId } }),
    prisma.garageAvailability.deleteMany({ where: { garageId } }),
    prisma.user.updateMany({ where: { garageId }, data: { garageId: null } }),
    prisma.garage.delete({ where: { id: garageId } }),
  ])

  revalidatePath("/admin/garages")
  revalidatePath("/admin")
}
