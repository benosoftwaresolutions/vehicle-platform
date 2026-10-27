import type { Metadata } from "next"
import { revalidatePath } from "next/cache"
import Navbar from "@/app/components/Navbar"
import FycaFooter from "@/app/components/FycaFooter"
import { prisma } from "@/app/lib/prisma"
import { verifyUnsubscribeToken } from "@/app/lib/unsubscribe"

export const metadata: Metadata = {
  title: "Email preferences — Fyca",
  robots: { index: false, follow: false },
}

// Landing page for the unsubscribe link in MOT/service reminder emails.
// Opening the page changes nothing; the button does. That way email
// security scanners that open every link can't unsubscribe anyone.
async function setReminders(formData: FormData) {
  "use server"
  const userId = String(formData.get("u") ?? "")
  const token = String(formData.get("t") ?? "")
  const enabled = formData.get("enabled") === "true"
  if (!verifyUnsubscribeToken(userId, token)) return
  await prisma.user.updateMany({ where: { id: userId }, data: { reminderEmails: enabled } })
  revalidatePath("/unsubscribe")
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; t?: string }>
}) {
  const { u, t } = await searchParams
  const valid = verifyUnsubscribeToken(u, t)
  const user = valid
    ? await prisma.user.findUnique({ where: { id: u! }, select: { reminderEmails: true } })
    : null

  const button = {
    background: "#111110", color: "#ffffff", padding: "12px 24px", borderRadius: 100,
    fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: "pointer",
  } as const

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px", minHeight: "50vh" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "2rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: 16 }}>
          MOT &amp; service reminders
        </h1>
        {!user ? (
          <p style={{ color: "#444441", lineHeight: 1.7 }}>
            This link isn&rsquo;t valid or has expired. Email{" "}
            <a href="mailto:hello@fyca.co.uk" style={{ color: "#111110" }}>hello@fyca.co.uk</a> and we&rsquo;ll stop the reminders for you.
          </p>
        ) : user.reminderEmails ? (
          <form action={setReminders}>
            <p style={{ color: "#444441", lineHeight: 1.7, marginBottom: 24 }}>
              Stop MOT and service reminder emails? You&rsquo;ll still get emails about bookings you make.
            </p>
            <input type="hidden" name="u" value={u} />
            <input type="hidden" name="t" value={t} />
            <input type="hidden" name="enabled" value="false" />
            <button type="submit" style={button}>Unsubscribe from reminders</button>
          </form>
        ) : (
          <form action={setReminders}>
            <p style={{ color: "#444441", lineHeight: 1.7, marginBottom: 24 }}>
              You&rsquo;re unsubscribed from MOT and service reminders. You&rsquo;ll still get emails about bookings you make.
            </p>
            <input type="hidden" name="u" value={u} />
            <input type="hidden" name="t" value={t} />
            <input type="hidden" name="enabled" value="true" />
            <button type="submit" style={{ ...button, background: "#ffffff", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)" }}>Turn reminders back on</button>
          </form>
        )}
      </main>
      <FycaFooter />
    </>
  )
}
