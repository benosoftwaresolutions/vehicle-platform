"use server"

import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateBookingStatus(
  bookingId: string, 
  status: string, 
  garageNote?: string,
  suggestedDate?: string,
  suggestedTime?: string
) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { 
      status,
      garageNote: garageNote || null,
      suggestedDate: suggestedDate ? new Date(suggestedDate) : null,
      suggestedTime: suggestedTime || null,
    }
  })

  revalidatePath("/garage-dashboard")
}