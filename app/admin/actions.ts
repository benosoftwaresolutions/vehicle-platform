"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath, updateTag } from "next/cache"
import { sendBookingConfirmedToCustomer, sendBookingDeclinedToCustomer } from "@/app/lib/email"

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
  revalidatePath("/admin/pending")
  revalidatePath("/admin")
}

// Accept or decline a booking on a garage's behalf. A support tool for the
// hands-on pilot phase — the customer gets the normal confirmation/decline
// email, identical to the garage doing it themselves. Only pending bookings
// can be actioned, so admin can't override a decision the garage already made.
export async function adminUpdateBookingStatus(bookingId: string, status: "confirmed" | "declined", garageNote?: string) {
  await assertAdmin()

  if (status !== "confirmed" && status !== "declined") throw new Error("Invalid status")

  const existing = await prisma.booking.findUnique({ where: { id: bookingId }, select: { status: true } })
  if (!existing) throw new Error("Booking not found")
  if (existing.status !== "pending") throw new Error("Only pending bookings can be actioned")

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status, garageNote: garageNote?.trim() || null },
  })

  const [customer, garage] = await Promise.all([
    booking.clerkId ? prisma.user.findUnique({ where: { clerkId: booking.clerkId } }) : null,
    prisma.garage.findUnique({ where: { id: booking.garageId } }),
  ])

  if (customer && garage) {
    const garageAddress = `${garage.address}, ${garage.city}, ${garage.postcode}`
    if (status === "confirmed") {
      await sendBookingConfirmedToCustomer({
        customerEmail: customer.email,
        customerName: customer.name ?? customer.email,
        garageName: garage.name,
        garageAddress,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        registration: booking.registration,
      }).catch(err => console.error("[admin] Failed to send confirmation email:", err))
    } else {
      await sendBookingDeclinedToCustomer({
        customerEmail: customer.email,
        customerName: customer.name ?? customer.email,
        garageName: garage.name,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        garageNote: booking.garageNote,
        suggestedDate: booking.suggestedDate,
        suggestedTime: booking.suggestedTime,
      }).catch(err => console.error("[admin] Failed to send decline email:", err))
    }
  }

  revalidatePath("/admin/bookings")
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
