"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendBookingConfirmedToCustomer, sendBookingDeclinedToCustomer } from "@/app/lib/email"

export async function updateBookingStatus(
  bookingId: string,
  status: string,
  garageNote?: string,
  suggestedDate?: string,
  suggestedTime?: string
) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      garageNote: garageNote || null,
      suggestedDate: suggestedDate ? new Date(suggestedDate) : null,
      suggestedTime: suggestedTime || null,
    }
  })

  // Send email notification to customer
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
      }).catch((err) => console.error("Failed to send confirmation email:", err))
    } else if (status === "declined") {
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
      }).catch((err) => console.error("Failed to send decline email:", err))
    }
  }

  revalidatePath("/garage-dashboard")
}

export async function createWalkInBooking(data: {
  garageId: string
  customerName: string
  customerPhone: string
  registration: string
  service: string
  date: string
  time: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorised")

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { garageId: true, role: true },
  })

  if (!user || user.role !== "garage_owner" || user.garageId !== data.garageId) {
    throw new Error("Unauthorised")
  }

  try {
    await prisma.booking.create({
      data: {
        garageId: data.garageId,
        service: data.service,
        date: new Date(data.date),
        time: data.time,
        registration: data.registration.toUpperCase(),
        status: "confirmed",
        isWalkIn: true,
        customerName: data.customerName.trim(),
        customerPhone: data.customerPhone.trim(),
      },
    })
  } catch (err) {
    console.error("[createWalkInBooking] Prisma error:", err)
    throw err
  }

  revalidatePath("/garage-dashboard")
}