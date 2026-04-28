"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"

async function assertAdmin() {
  const adminId = process.env.ADMIN_USER_ID
  if (!adminId) throw new Error("ADMIN_USER_ID environment variable is not set")
  const { userId } = await auth()
  if (!userId || userId !== adminId) {
    throw new Error("Unauthorised")
  }
}

export async function updateUserRole(userId: string, role: string) {
  await assertAdmin()
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/users")
  revalidatePath("/admin/garages")
}

export async function approveGarage(garageId: string) {
  await assertAdmin()
  await prisma.garage.update({ where: { id: garageId }, data: { approved: true } })
  revalidatePath("/admin/garages")
  revalidatePath("/garages")
  revalidatePath("/")
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
