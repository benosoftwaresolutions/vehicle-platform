import { Resend } from "resend"

const FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev"

// Lazy-initialise so missing key doesn't crash the build
function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set")
  return new Resend(key)
}

async function sendWithRetry(payload: Parameters<Resend["emails"]["send"]>[0], attempts = 3): Promise<void> {
  const resend = getResend()
  for (let i = 0; i < attempts; i++) {
    const { error } = await resend.emails.send(payload)
    if (!error) return
    if (i < attempts - 1) await new Promise(r => setTimeout(r, 500 * 2 ** i))
    else {
      console.error("[email] Failed after", attempts, "attempts:", error, "| subject:", payload.subject)
      throw new Error(`Email delivery failed: ${error?.message ?? "unknown error"}`)
    }
  }
}

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
                <td style="background:#111110;border-radius:11px;width:28px;height:28px;text-align:center;vertical-align:middle;">
                  <span style="color:#ffffff;font-size:16px;font-weight:700;line-height:28px;letter-spacing:-0.04em;font-family:Georgia,serif;">F</span>
                </td>
                <td style="padding-left:8px;">
                  <div style="font-size:16px;font-weight:700;color:#111110;letter-spacing:-0.04em;line-height:1;">Fyca</div>
                  <div style="font-size:8px;font-weight:500;color:#aaa9a4;letter-spacing:0.13em;text-transform:uppercase;line-height:1;margin-top:2px;">Fix Your Car Anywhere</div>
                </td>
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
            Fyca — Fix Your Car Anywhere · fyca.co.uk
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
  await sendWithRetry({
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
  await sendWithRetry({
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
  await sendWithRetry({
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
  await sendWithRetry({
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
  customerEmail,
  service,
  date,
  time,
  registration,
}: {
  garageOwnerEmail: string
  garageName: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  service: string
  date: Date
  time: string
  registration: string
}) {
  const contactRows: [string, string][] = []
  if (customerPhone) contactRows.push(["Phone", customerPhone])
  if (customerEmail) contactRows.push(["Email", customerEmail])

  await sendWithRetry({
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
        ...contactRows,
      ])}
    `),
  })
}

export async function sendBookingRescheduledToCustomer({
  customerEmail,
  customerName,
  garageName,
  garageAddress,
  service,
  oldDate,
  oldTime,
  newDate,
  newTime,
  registration,
}: {
  customerEmail: string
  customerName: string
  garageName: string
  garageAddress: string
  service: string
  oldDate: Date
  oldTime: string
  newDate: Date
  newTime: string
  registration: string
}) {
  await sendWithRetry({
    from: FROM,
    to: customerEmail,
    subject: `Booking rescheduled — ${service} at ${garageName}`,
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Your booking has been rescheduled</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 16px;">Hi ${customerName}, <strong style="color:#111110;">${garageName}</strong> has moved your booking to a new time.</p>
      <p style="font-size:13px;color:#6b6a66;margin:0 0 4px;">Previous slot</p>
      ${dataTable([
        ["Service", service],
        ["Date", formatDate(oldDate)],
        ["Time", oldTime],
        ["Registration", registration],
      ])}
      <p style="font-size:13px;color:#6b6a66;margin:16px 0 4px;">New slot</p>
      ${dataTable([
        ["Date", formatDate(newDate)],
        ["Time", newTime],
        ["Garage", garageName],
        ["Address", garageAddress],
      ])}
      <p style="margin-top:24px;font-size:14px;color:#444441;">If this new time does not work for you, please contact the garage directly or cancel via the app.</p>
    `),
  })
}

export async function sendMessageToCustomer({
  customerEmail,
  customerName,
  garageName,
  service,
  date,
  time,
  message,
}: {
  customerEmail: string
  customerName: string
  garageName: string
  service: string
  date: Date
  time: string
  message: string
}) {
  await sendWithRetry({
    from: FROM,
    to: customerEmail,
    subject: `Message from ${garageName} about your booking`,
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Message from ${garageName}</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 16px;">Hi ${customerName}, you have a message regarding your <strong style="color:#111110;">${service}</strong> booking on <strong style="color:#111110;">${formatDate(date)} at ${time}</strong>.</p>
      <div style="background:#f4f3ef;border-radius:10px;padding:16px 20px;font-size:14px;color:#111110;line-height:1.6;">${message.replace(/\n/g, "<br>")}</div>
      <p style="margin-top:20px;font-size:13px;color:#6b6a66;">This message was sent via Fyca on behalf of ${garageName}. To reply, contact the garage directly.</p>
    `),
  })
}

export async function sendJobCompletedToCustomer({
  customerEmail,
  customerName,
  garageName,
  service,
  date,
  registration,
  jobValue,
}: {
  customerEmail: string
  customerName: string
  garageName: string
  service: string
  date: Date
  registration: string
  jobValue?: number | null
}) {
  await sendWithRetry({
    from: FROM,
    to: customerEmail,
    subject: `Your car is ready — ${service} at ${garageName}`,
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Your car is ready</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 4px;">Hi ${customerName}, your <strong style="color:#111110;">${service}</strong> at <strong style="color:#111110;">${garageName}</strong> has been completed.</p>
      ${dataTable([
        ["Service", service],
        ["Date", formatDate(date)],
        ["Registration", registration],
        ...(jobValue ? [["Job total", `£${jobValue.toFixed(2)}`] as [string, string]] : []),
      ])}
      <p style="margin-top:24px;font-size:14px;color:#444441;">If you were happy with the service, we'd love a review — it helps other drivers find great garages.</p>
    `),
  })
}

export async function sendAppointmentReminder({
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
  await sendWithRetry({
    from: FROM,
    to: customerEmail,
    subject: `Reminder: ${service} at ${garageName} tomorrow`,
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Your appointment is tomorrow</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 4px;">Hi ${customerName}, just a reminder about your upcoming booking.</p>
      ${dataTable([
        ["Service", service],
        ["Date", formatDate(date)],
        ["Time", time],
        ["Registration", registration],
        ["Garage", garageName],
        ["Address", garageAddress],
      ])}
      <p style="margin-top:24px;font-size:14px;color:#444441;">Please arrive a few minutes early. If you need to cancel, please do so via the Fyca app as soon as possible.</p>
    `),
  })
}

export async function sendBookingCancelledToGarage({
  garageOwnerEmail,
  garageName,
  customerName,
  service,
  date,
  time,
  registration,
}: {
  garageOwnerEmail: string
  garageName: string
  customerName: string
  service: string
  date: Date
  time: string
  registration: string
}) {
  await sendWithRetry({
    from: FROM,
    to: garageOwnerEmail,
    subject: `Booking cancelled — ${service} on ${formatDate(date)}`,
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Booking Cancelled</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 4px;">A customer has cancelled their booking at <strong style="color:#111110;">${garageName}</strong>.</p>
      ${dataTable([
        ["Service", service],
        ["Date", formatDate(date)],
        ["Time", time],
        ["Registration", registration],
        ["Customer", customerName],
      ])}
      <p style="margin-top:24px;font-size:14px;color:#444441;">This slot is now free. No action is needed.</p>
    `),
  })
}

export async function sendMotReminder({
  customerEmail,
  customerName,
  registration,
  make,
  model,
  motExpiry,
  daysUntilExpiry,
}: {
  customerEmail: string
  customerName: string
  registration: string
  make: string
  model: string
  motExpiry: Date
  daysUntilExpiry: number
}) {
  const urgency = daysUntilExpiry <= 7 ? "urgent" : daysUntilExpiry <= 14 ? "soon" : "upcoming"
  const urgencyLabel = urgency === "urgent" ? "⚠️ Urgent — " : ""

  await sendWithRetry({
    from: FROM,
    to: customerEmail,
    subject: `${urgencyLabel}MOT due in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} — ${registration}`,
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Your MOT is due soon</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 16px;">Hi ${customerName}, your MOT expires in <strong style="color:${daysUntilExpiry <= 7 ? "#dc2626" : "#111110"};">${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}</strong>. Driving without a valid MOT is illegal — book your test now.</p>
      ${dataTable([
        ["Vehicle", `${make} ${model}`],
        ["Registration", registration],
        ["MOT expires", formatDate(motExpiry)],
      ])}
      <p style="margin-top:24px;">
        <a href="https://www.gov.uk/get-mot-reminder" style="display:inline-block;background:#111110;color:#ffffff;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none;">Find a garage on Fyca</a>
      </p>
      <p style="margin-top:16px;font-size:13px;color:#6b6a66;">You can manage your vehicle reminders in <a href="https://fyca.co.uk/vehicles" style="color:#111110;">My Vehicles</a> on Fyca.</p>
    `),
  })
}

export async function sendServiceReminder({
  customerEmail,
  customerName,
  registration,
  make,
  model,
  nextServiceDue,
  daysUntilService,
}: {
  customerEmail: string
  customerName: string
  registration: string
  make: string
  model: string
  nextServiceDue: Date
  daysUntilService: number
}) {
  await sendWithRetry({
    from: FROM,
    to: customerEmail,
    subject: `Service due in ${daysUntilService} day${daysUntilService === 1 ? "" : "s"} — ${registration}`,
    html: emailBase(`
      <h2 style="font-size:22px;font-weight:600;color:#111110;margin:0 0 6px;letter-spacing:-0.02em;">Your service is due soon</h2>
      <p style="color:#6b6a66;font-size:14px;margin:0 0 16px;">Hi ${customerName}, your next service is due in <strong style="color:#111110;">${daysUntilService} day${daysUntilService === 1 ? "" : "s"}</strong>. Regular servicing keeps your car running safely and protects its value.</p>
      ${dataTable([
        ["Vehicle", `${make} ${model}`],
        ["Registration", registration],
        ["Service due", formatDate(nextServiceDue)],
      ])}
      <p style="margin-top:24px;">
        <a href="https://fyca.co.uk/garages" style="display:inline-block;background:#111110;color:#ffffff;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:600;text-decoration:none;">Book a service on Fyca</a>
      </p>
      <p style="margin-top:16px;font-size:13px;color:#6b6a66;">You can manage your vehicle reminders in <a href="https://fyca.co.uk/vehicles" style="color:#111110;">My Vehicles</a> on Fyca.</p>
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

  await sendWithRetry({
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
