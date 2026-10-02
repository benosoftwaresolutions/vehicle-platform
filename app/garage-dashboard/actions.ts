"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { rateLimit } from "@/app/lib/rateLimit"
import { requiredText, text, email, ValidationError } from "@/app/lib/validate"
import { sendBookingConfirmedToCustomer, sendBookingDeclinedToCustomer, sendWalkInBookingToGarage, sendWalkInConfirmationToCustomer, sendBookingRescheduledToCustomer, sendMessageToCustomer, sendJobCompletedToCustomer } from "@/app/lib/email"

export async function updateBookingStatus(
  bookingId: string,
  status: string,
  garageNote?: string,
  suggestedDate?: string,
  suggestedTime?: string,
  jobValue?: number
) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorised")

  const [user, targetBooking] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true, role: true } }),
    prisma.booking.findUnique({ where: { id: bookingId }, select: { garageId: true } }),
  ])

  if (!user || user.role !== "garage_owner" || !user.garageId) throw new Error("Unauthorised")
  if (!targetBooking || targetBooking.garageId !== user.garageId) throw new Error("Unauthorised")

  const validStatuses = ["confirmed", "declined", "pending", "declined_by_customer", "completed"]
  if (!validStatuses.includes(status)) throw new Error("Invalid status")

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      garageNote: garageNote || null,
      suggestedDate: suggestedDate ? new Date(suggestedDate) : null,
      suggestedTime: suggestedTime || null,
      ...(jobValue !== undefined && { jobValue }),
    }
  })

  // Send email notification to customer
  const [customer, garage] = await Promise.all([
    booking.clerkId ? prisma.user.findUnique({ where: { clerkId: booking.clerkId } }) : null,
    prisma.garage.findUnique({ where: { id: booking.garageId } }),
  ])

  // Registered customers are emailed via their account; walk-ins via the
  // email typed at the counter (if any).
  const recipient = customer
    ? { email: customer.email, name: customer.name ?? customer.email }
    : booking.customerEmail
      ? { email: booking.customerEmail, name: booking.customerName ?? booking.customerEmail }
      : null

  if (recipient && garage) {
    const garageAddress = `${garage.address}, ${garage.city}, ${garage.postcode}`

    if (status === "confirmed") {
      await sendBookingConfirmedToCustomer({
        customerEmail: recipient.email,
        customerName: recipient.name,
        garageName: garage.name,
        garageAddress,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        registration: booking.registration,
      }).catch((err) => console.error("Failed to send confirmation email:", err))
    } else if (status === "completed") {
      await sendJobCompletedToCustomer({
        customerEmail: recipient.email,
        customerName: recipient.name,
        garageName: garage.name,
        service: booking.service,
        date: booking.date,
        registration: booking.registration,
        jobValue: booking.jobValue,
        garageId: garage.id,
        googleReviewUrl: `https://search.google.com/local/writereview?query=${encodeURIComponent(`${garage.name} ${garage.address} ${garage.city}`)}`,
      }).catch(err => console.error("Failed to send completion email:", err))
    } else if (status === "declined") {
      await sendBookingDeclinedToCustomer({
        customerEmail: recipient.email,
        customerName: recipient.name,
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

  // Client refreshes after showing an in-place confirmation (useSettledRefresh)
}

export async function rescheduleBooking(bookingId: string, newDate: string, newTime: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorised")

  const [user, targetBooking] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true, role: true } }),
    prisma.booking.findUnique({ where: { id: bookingId } }),
  ])

  if (!user || user.role !== "garage_owner" || !user.garageId) throw new Error("Unauthorised")
  if (!targetBooking || targetBooking.garageId !== user.garageId) throw new Error("Unauthorised")

  const oldDate = targetBooking.date
  const oldTime = targetBooking.time

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { date: new Date(newDate), time: newTime },
  })

  const [customer, garage] = await Promise.all([
    booking.clerkId ? prisma.user.findUnique({ where: { clerkId: booking.clerkId } }) : null,
    prisma.garage.findUnique({ where: { id: booking.garageId } }),
  ])

  const recipient = customer
    ? { email: customer.email, name: customer.name ?? customer.email }
    : booking.customerEmail
      ? { email: booking.customerEmail, name: booking.customerName ?? booking.customerEmail }
      : null

  if (recipient && garage) {
    await sendBookingRescheduledToCustomer({
      customerEmail: recipient.email,
      customerName: recipient.name,
      garageName: garage.name,
      garageAddress: `${garage.address}, ${garage.city}, ${garage.postcode}`,
      service: booking.service,
      oldDate,
      oldTime,
      newDate: booking.date,
      newTime: booking.time,
      registration: booking.registration,
    }).catch(err => console.error("Failed to send reschedule email:", err))
  }

  // Client refreshes after showing an in-place confirmation (useSettledRefresh)
}

export async function messageCustomer(bookingId: string, message: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorised")

  const [user, booking] = await Promise.all([
    prisma.user.findUnique({ where: { clerkId: userId }, select: { garageId: true, role: true } }),
    prisma.booking.findUnique({ where: { id: bookingId } }),
  ])

  if (!user || user.role !== "garage_owner" || !user.garageId) throw new Error("Unauthorised")
  if (!booking || booking.garageId !== user.garageId) throw new Error("Unauthorised")
  if (!message.trim()) throw new Error("Message cannot be empty")
  if (message.length > 2000) throw new Error("Message must be 2000 characters or fewer")

  // Each message is an email sent from our domain. Limit per garage so a
  // compromised or abusive account can't use Fyca to send bulk email.
  if (!await rateLimit(`message-customer:${user.garageId}`, 20, 60 * 60_000)) {
    throw new Error("You've sent a lot of messages in the last hour. Please try again later.")
  }

  const [customer, garage] = await Promise.all([
    booking.clerkId ? prisma.user.findUnique({ where: { clerkId: booking.clerkId } }) : null,
    prisma.garage.findUnique({ where: { id: booking.garageId } }),
  ])

  const recipientEmail = customer?.email ?? (booking.isWalkIn ? booking.customerEmail : null)
  const recipientName = customer?.name ?? booking.customerName ?? "Customer"

  if (!recipientEmail || !garage) throw new Error("Cannot find customer contact details")

  await sendMessageToCustomer({
    customerEmail: recipientEmail,
    customerName: recipientName,
    garageName: garage.name,
    service: booking.service,
    date: booking.date,
    time: booking.time,
    message: message.trim(),
  })
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

  // Walk-in bookings email a confirmation to whatever address is typed in,
  // and anyone can start a free trial — so without a limit this is a way to
  // send spam from our domain. 30 an hour is far above a real garage's pace.
  if (!await rateLimit(`walk-in:${user.garageId}`, 30, 60 * 60_000)) {
    throw new Error("Too many walk-in bookings in the last hour. Please try again later.")
  }

  // Validate and normalise every field. Empty optional fields become "" so
  // the code below (which calls .trim() on them) works unchanged.
  data = {
    garageId: data.garageId,
    customerName: requiredText(data.customerName, "Customer name", 100),
    customerPhone: text(data.customerPhone, "Phone", 30) ?? "",
    customerEmail: email(data.customerEmail, "Email") ?? "",
    registration: requiredText(data.registration, "Registration", 20),
    service: requiredText(data.service, "Service", 100),
    date: requiredText(data.date, "Date", 30),
    time: requiredText(data.time, "Time", 5),
  }
  if (isNaN(new Date(data.date).getTime())) throw new ValidationError("Date is invalid")
  if (!/^\d{2}:\d{2}$/.test(data.time)) throw new ValidationError("Time must be in HH:MM format")

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
    prisma.garage.findUnique({ where: { id: data.garageId }, select: { name: true, email: true, address: true, phone: true } }),
    prisma.user.findFirst({ where: { garageId: data.garageId, role: "garage_owner" }, select: { email: true } }),
  ])

  if (garage && garageOwner) {
    await sendWalkInBookingToGarage({
      // Prefer the garage's own bookings inbox; fall back to the owner's
      // account email for garages signed up before it was mandatory.
      garageOwnerEmail: garage.email ?? garageOwner.email,
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

  // Confirmation to the customer, if they gave an email at the counter
  const customerEmail = data.customerEmail.trim()
  if (garage && customerEmail) {
    await sendWalkInConfirmationToCustomer({
      customerEmail,
      customerName: data.customerName.trim(),
      garageName: garage.name,
      garageAddress: garage.address,
      garagePhone: garage.phone,
      service: data.service,
      date: new Date(data.date),
      time: data.time,
      registration: data.registration.toUpperCase(),
    }).catch((err) => console.error("Failed to send walk-in customer confirmation:", err))
  }

  // Client refreshes after showing an in-place confirmation (useSettledRefresh)
}