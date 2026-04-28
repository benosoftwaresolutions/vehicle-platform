"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendBookingConfirmedToCustomer, sendBookingDeclinedToCustomer, sendWalkInBookingToGarage } from "@/app/lib/email"

export async function updateBookingStatus(
  bookingId: string,
  status: string,
  garageNote?: string,
  suggestedDate?: string,
  suggestedTime?: string
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorised")

  const [user, targetBooking] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true, role: true } }),
    prisma.booking.findUnique({ where: { id: bookingId }, select: { garageId: true } }),
  ])

  if (!user || user.role !== "garage_owner" || !user.garageId) throw new Error("Unauthorised")
  if (!targetBooking || targetBooking.garageId !== user.garageId) throw new Error("Unauthorised")

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
  customerEmail: string
  registration: string
  service: string
  date: string
  time: string
}) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorised")

  if (!data.customerPhone.trim() && !data.customerEmail.trim()) {
    throw new Error("A phone number or email address is required")
  }

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
        customerPhone: data.customerPhone.trim() || null,
        customerEmail: data.customerEmail.trim() || null,
      },
    })
  } catch (err) {
    console.error("[createWalkInBooking] Prisma error:", err)
    throw err
  }

  // Email notification to garage owner
  const [garage, garageOwner] = await Promise.all([
    prisma.garage.findUnique({ where: { id: data.garageId }, select: { name: true } }),
    prisma.user.findFirst({ where: { garageId: data.garageId, role: "garage_owner" }, select: { email: true } }),
  ])

  if (garage && garageOwner) {
    await sendWalkInBookingToGarage({
      garageOwnerEmail: garageOwner.email,
      garageName: garage.name,
      customerName: data.customerName,
      customerPhone: data.customerPhone.trim() || undefined,
      customerEmail: data.customerEmail.trim() || undefined,
      service: data.service,
      date: new Date(data.date),
      time: data.time,
      registration: data.registration.toUpperCase(),
    }).catch((err) => console.error("Failed to send walk-in booking email:", err))
  }

  revalidatePath("/garage-dashboard")
}