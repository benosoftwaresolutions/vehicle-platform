"use server"

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
    prisma.user.findUnique({ where: { clerkId: booking.clerkId } }),
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