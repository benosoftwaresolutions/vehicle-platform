"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath, updateTag } from "next/cache"

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
  const updated = await prisma.user.update({ where: { id: userId }, data: { role }, select: { clerkId: true } })
  updateTag(`user-${updated.clerkId}`)
  revalidatePath("/admin/users")
  revalidatePath("/admin/garages")
}

export async function approveGarage(garageId: string) {
  await assertAdmin()
  await prisma.garage.update({ where: { id: garageId }, data: { approved: true } })
  updateTag("garages")
  revalidatePath("/admin/garages")
}

export async function saveAdminNotes(garageId: string, notes: string) {
  await assertAdmin()
  await prisma.garage.update({ where: { id: garageId }, data: { adminNotes: notes.trim() || null } })
  revalidatePath(`/admin/garages/${garageId}`)
}

export async function deleteGarage(garageId: string) {
  await assertAdmin()

  // Delete all associated records before the garage (order matters for FK constraints)
  const availability = await prisma.garageAvailability.findUnique({ where: { garageId }, select: { id: true } })
  await prisma.$transaction([
    ...(availability ? [prisma.daySchedule.deleteMany({ where: { availabilityId: availability.id } })] : []),
    prisma.booking.deleteMany({ where: { garageId } }),
    prisma.review.deleteMany({ where: { garageId } }),
    prisma.serviceType.deleteMany({ where: { garageId } }),
    prisma.part.deleteMany({ where: { garageId } }),
    prisma.customerNote.deleteMany({ where: { garageId } }),
    prisma.garageAvailability.deleteMany({ where: { garageId } }),
    prisma.user.updateMany({ where: { garageId }, data: { garageId: null } }),
    prisma.garage.delete({ where: { id: garageId } }),
  ])

  updateTag("garages")
  revalidatePath("/admin/garages")
  revalidatePath("/admin")
}

export async function declinePendingGarage(userId: string, garageId: string) {
  await assertAdmin()

  const availability = await prisma.garageAvailability.findUnique({ where: { garageId }, select: { id: true } })
  await prisma.$transaction([
    ...(availability ? [prisma.daySchedule.deleteMany({ where: { availabilityId: availability.id } })] : []),
    prisma.booking.deleteMany({ where: { garageId } }),
    prisma.review.deleteMany({ where: { garageId } }),
    prisma.serviceType.deleteMany({ where: { garageId } }),
    prisma.part.deleteMany({ where: { garageId } }),
    prisma.customerNote.deleteMany({ where: { garageId } }),
    prisma.garageAvailability.deleteMany({ where: { garageId } }),
    prisma.user.update({ where: { id: userId }, data: { garageId: null, role: "driver" } }),
    prisma.garage.delete({ where: { id: garageId } }),
  ])

  updateTag("garages")
  revalidatePath("/admin/pending")
  revalidatePath("/admin")
}
