import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev"

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function emailBase(content: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
</head>
<body style="margin:0;padding:0;background:#f4f3ef;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f3ef;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:24px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#111110;border-radius:7px;width:28px;height:28px;text-align:center;vertical-align:middle;">
                  <span style="color:#ffffff;font-size:14px;line-height:28px;">&#8593;</span>
                </td>
                <td style="padding-left:8px;font-size:16px;font-weight:600;color:#111110;letter-spacing:-0.02em;">dryvn</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#ffffff;border-radius:14px;padding:32px;border:0.5px solid rgba(0,0,0,0.08);">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding-top:20px;text-align:center;font-size:12px;color:#6b6a66;">
            dryvn — the smarter way to book a garage
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function dataTable(rows: [string, string][]) {
  return `<table cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;">
    ${rows.map(([label, value]) => `
      <tr>
        <td style="padding:8px 0;border-bottom:0.5px solid rgba(0,0,0,0.07);font-size:13px;color:#6b6a66;width:140px;vertical-align:top;">${label}</td>
        <td style="padding:8px 0;border-bottom:0.5px solid rgba(0,0,0,0.07);font-size:13px;color:#111110;font-weight:500;">${value}</td>
      </tr>`).join("")}
  </table>`
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
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">New Booking Request</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 4px;">You have a new booking request at <strong style="color:#111110;">${garageName}</strong>.</p>
      ${dataTable([
        ["Service", service],
        ["Date", formatDate(date)],
        ["Time", time],
        ["Registration", registration],
        ["Customer", customerName],
        ["Customer email", customerEmail],
        ["Booking ID", bookingId],
      ])}
      <p style="margin-top:24px;font-size:14px;color:#444441;">Log in to your garage dashboard to accept or decline this booking.</p>
    `),
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
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Your booking is confirmed</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 4px;">Hi ${customerName}, your booking has been accepted by <strong style="color:#111110;">${garageName}</strong>.</p>
      ${dataTable([
        ["Service", service],
        ["Date", formatDate(date)],
        ["Time", time],
        ["Registration", registration],
        ["Garage", garageName],
        ["Address", garageAddress],
      ])}
      <p style="margin-top:24px;font-size:14px;color:#444441;">Please arrive a few minutes before your appointment time.</p>
    `),
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
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Customer Accepted Alternative Slot</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 4px;"><strong style="color:#111110;">${customerName}</strong> has accepted the alternative time you offered at <strong style="color:#111110;">${garageName}</strong>.</p>
      ${dataTable([
        ["Service", service],
        ["Date", formatDate(confirmedDate)],
        ["Time", confirmedTime],
        ["Registration", registration],
      ])}
      <p style="margin-top:24px;font-size:14px;color:#444441;">This booking is now confirmed.</p>
    `),
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
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Customer Declined Alternative Slot</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0;"><strong style="color:#111110;">${customerName}</strong> has declined the alternative time you offered at <strong style="color:#111110;">${garageName}</strong> for <strong style="color:#111110;">${service}</strong> on <strong style="color:#111110;">${formatDate(date)} at ${time}</strong>.</p>
      <p style="margin-top:16px;font-size:14px;color:#444441;">The booking has been closed.</p>
    `),
  })
}

export async function sendWalkInBookingToGarage({
  garageOwnerEmail,
  garageName,
  customerName,
  customerPhone,
  service,
  date,
  time,
  registration,
}: {
  garageOwnerEmail: string
  garageName: string
  customerName: string
  customerPhone: string
  service: string
  date: Date
  time: string
  registration: string
}) {
  await resend.emails.send({
    from: FROM,
    to: garageOwnerEmail,
    subject: `Walk-in booked — ${service} on ${formatDate(date)}`,
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Walk-in Booking Created</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 4px;">A walk-in booking has been added to <strong style="color:#111110;">${garageName}</strong>.</p>
      ${dataTable([
        ["Service", service],
        ["Date", formatDate(date)],
        ["Time", time],
        ["Registration", registration],
        ["Customer", customerName],
        ["Phone", customerPhone],
      ])}
    `),
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
  const alternativeBlock = suggestedDate
    ? `<p style="margin-top:16px;font-size:14px;color:#444441;background:#f4f3ef;padding:12px 16px;border-radius:8px;"><strong>Alternative slot offered:</strong> ${formatDate(suggestedDate)}${suggestedTime ? ` at ${suggestedTime}` : ""}</p>`
    : ""

  const noteBlock = garageNote
    ? `<p style="margin-top:12px;font-size:14px;color:#444441;"><strong>Reason:</strong> ${garageNote}</p>`
    : ""

  await resend.emails.send({
    from: FROM,
    to: customerEmail,
    subject: `Booking update — ${service} at ${garageName}`,
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Your booking could not be accepted</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0;">Hi ${customerName}, unfortunately <strong style="color:#111110;">${garageName}</strong> is unable to take your booking for <strong style="color:#111110;">${service}</strong> on <strong style="color:#111110;">${formatDate(date)} at ${time}</strong>.</p>
      ${noteBlock}
      ${alternativeBlock}
      <p style="margin-top:20px;font-size:14px;color:#444441;">You can search for another available garage or try a different date.</p>
    `),
  })
}
