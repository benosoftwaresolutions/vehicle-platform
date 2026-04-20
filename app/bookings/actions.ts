"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendAlternativeAcceptedToGarage, sendAlternativeDeclinedToGarage } from "@/app/lib/email"

export async function respondToAlternative(bookingId: string, response: "accept" | "decline") {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorised")

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking || booking.clerkId !== userId) throw new Error("Unauthorised")
  if (booking.status !== "declined" || !booking.suggestedDate || !booking.suggestedTime) {
    throw new Error("No alternative to respond to")
  }

  if (response === "accept") {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "confirmed",
        date: booking.suggestedDate,
        time: booking.suggestedTime,
        suggestedDate: null,
        suggestedTime: null,
      },
    })

    // Email garage owner
    const [customer, garage] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId: userId }, select: { email: true, name: true } }),
      prisma.garage.findUnique({ where: { id: booking.garageId } }),
    ])
    const garageOwner = garage
      ? await prisma.user.findFirst({ where: { garageId: garage.id, role: "garage_owner" }, select: { email: true } })
      : null

    if (garageOwner && garage && customer) {
      await sendAlternativeAcceptedToGarage({
        garageOwnerEmail: garageOwner.email,
        garageName: garage.name,
        customerName: customer.name ?? customer.email,
        service: booking.service,
        confirmedDate: booking.suggestedDate,
        confirmedTime: booking.suggestedTime,
        registration: booking.registration,
      }).catch((err) => console.error("Failed to send alternative-accepted email:", err))
    }
  } else {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "declined_by_customer",
        suggestedDate: null,
        suggestedTime: null,
      },
    })

    // Email garage owner
    const [customer, garage] = await Promise.all([
      prisma.user.findUnique({ where: { clerkId: userId }, select: { email: true, name: true } }),
      prisma.garage.findUnique({ where: { id: booking.garageId } }),
    ])
    const garageOwner = garage
      ? await prisma.user.findFirst({ where: { garageId: garage.id, role: "garage_owner" }, select: { email: true } })
      : null

    if (garageOwner && garage && customer) {
      await sendAlternativeDeclinedToGarage({
        garageOwnerEmail: garageOwner.email,
        garageName: garage.name,
        customerName: customer.name ?? customer.email,
        service: booking.service,
        date: booking.suggestedDate,
        time: booking.suggestedTime,
      }).catch((err) => console.error("Failed to send alternative-declined email:", err))
    }
  }

  revalidatePath("/bookings")
}
