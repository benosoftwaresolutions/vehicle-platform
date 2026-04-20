import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "onboarding@resend.dev"

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export async function sendNewBookingToGarage({
  garageOwnerEmail,
  garageName,
  customerName,
  customerEmail,
  service,
  date,
  time,
  registration,
  bookingId,
}: {
  garageOwnerEmail: string
  garageName: string
  customerName: string
  customerEmail: string
  service: string
  date: Date
  time: string
  registration: string
  bookingId: string
}) {
  await resend.emails.send({
    from: FROM,
    to: garageOwnerEmail,
    subject: `New booking request — ${service} on ${formatDate(date)}`,
    html: `
      <h2>New Booking Request</h2>
      <p>You have a new booking request at <strong>${garageName}</strong>.</p>
      <table cellpadding="8" style="border-collapse:collapse;">
        <tr><td><strong>Service</strong></td><td>${service}</td></tr>
        <tr><td><strong>Date</strong></td><td>${formatDate(date)}</td></tr>
        <tr><td><strong>Time</strong></td><td>${time}</td></tr>
        <tr><td><strong>Registration</strong></td><td>${registration}</td></tr>
        <tr><td><strong>Customer</strong></td><td>${customerName}</td></tr>
        <tr><td><strong>Customer email</strong></td><td>${customerEmail}</td></tr>
        <tr><td><strong>Booking ID</strong></td><td>${bookingId}</td></tr>
      </table>
      <p>Log in to your garage dashboard to accept or decline this booking.</p>
    `,
  })
}

export async function sendBookingConfirmedToCustomer({
  customerEmail,
  customerName,
  garageName,
  garageAddress,
  service,
  date,
  time,
  registration,
}: {
  customerEmail: string
  customerName: string
  garageName: string
  garageAddress: string
  service: string
  date: Date
  time: string
  registration: string
}) {
  await resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Booking confirmed — ${service} at ${garageName}`,
    html: `
      <h2>Your booking is confirmed!</h2>
      <p>Hi ${customerName}, your booking has been accepted by <strong>${garageName}</strong>.</p>
      <table cellpadding="8" style="border-collapse:collapse;">
        <tr><td><strong>Service</strong></td><td>${service}</td></tr>
        <tr><td><strong>Date</strong></td><td>${formatDate(date)}</td></tr>
        <tr><td><strong>Time</strong></td><td>${time}</td></tr>
        <tr><td><strong>Registration</strong></td><td>${registration}</td></tr>
        <tr><td><strong>Garage</strong></td><td>${garageName}</td></tr>
        <tr><td><strong>Address</strong></td><td>${garageAddress}</td></tr>
      </table>
      <p>Please arrive a few minutes before your appointment time.</p>
    `,
  })
}

export async function sendAlternativeAcceptedToGarage({
  garageOwnerEmail,
  garageName,
  customerName,
  service,
  confirmedDate,
  confirmedTime,
  registration,
}: {
  garageOwnerEmail: string
  garageName: string
  customerName: string
  service: string
  confirmedDate: Date
  confirmedTime: string
  registration: string
}) {
  await resend.emails.send({
    from: FROM,
    to: garageOwnerEmail,
    subject: `Customer accepted alternative — ${service} on ${formatDate(confirmedDate)}`,
    html: `
      <h2>Customer Accepted Alternative Slot</h2>
      <p><strong>${customerName}</strong> has accepted the alternative time you offered at <strong>${garageName}</strong>.</p>
      <table cellpadding="8" style="border-collapse:collapse;">
        <tr><td><strong>Service</strong></td><td>${service}</td></tr>
        <tr><td><strong>Date</strong></td><td>${formatDate(confirmedDate)}</td></tr>
        <tr><td><strong>Time</strong></td><td>${confirmedTime}</td></tr>
        <tr><td><strong>Registration</strong></td><td>${registration}</td></tr>
      </table>
      <p>This booking is now confirmed.</p>
    `,
  })
}

export async function sendAlternativeDeclinedToGarage({
  garageOwnerEmail,
  garageName,
  customerName,
  service,
  date,
  time,
}: {
  garageOwnerEmail: string
  garageName: string
  customerName: string
  service: string
  date: Date
  time: string
}) {
  await resend.emails.send({
    from: FROM,
    to: garageOwnerEmail,
    subject: `Customer declined alternative — ${service}`,
    html: `
      <h2>Customer Declined Alternative Slot</h2>
      <p><strong>${customerName}</strong> has declined the alternative time you offered at <strong>${garageName}</strong> for <strong>${service}</strong> on <strong>${formatDate(date)} at ${time}</strong>.</p>
      <p>The booking has been closed.</p>
    `,
  })
}

export async function sendBookingDeclinedToCustomer({
  customerEmail,
  customerName,
  garageName,
  service,
  date,
  time,
  garageNote,
  suggestedDate,
  suggestedTime,
}: {
  customerEmail: string
  customerName: string
  garageName: string
  service: string
  date: Date
  time: string
  garageNote?: string | null
  suggestedDate?: Date | null
  suggestedTime?: string | null
}) {
  const alternativeBlock =
    suggestedDate
      ? `<p><strong>Alternative slot offered:</strong> ${formatDate(suggestedDate)}${suggestedTime ? ` at ${suggestedTime}` : ""}</p>`
      : ""

  const noteBlock = garageNote
    ? `<p><strong>Reason:</strong> ${garageNote}</p>`
    : ""

  await resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Booking update — ${service} at ${garageName}`,
    html: `
      <h2>Your booking could not be accepted</h2>
      <p>Hi ${customerName}, unfortunately <strong>${garageName}</strong> is unable to take your booking for <strong>${service}</strong> on <strong>${formatDate(date)} at ${time}</strong>.</p>
      ${noteBlock}
      ${alternativeBlock}
      <p>You can search for another available garage or try a different date.</p>
    `,
  })
}
