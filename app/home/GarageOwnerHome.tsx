import Link from "next/link"
import Navbar from "../components/Navbar"
import FycaFooter from "../components/FycaFooter"
import ShareProfileCard from "../garage-dashboard/ShareProfileCard"
import { getGarageOwnerContext } from "../garage-dashboard/layout"
import { prisma } from "../lib/prisma"

// Homepage for a signed-in garage owner. Drivers get "find a garage"; a
// garage owner gets "how to get the most out of Fyca": what needs attention
// today, their booking link, and a checklist of the features that make Fyca
// worth paying for. Each checklist item is ticked off from real data, so it
// keeps nudging until the habit actually exists.

// Booking.date is stored as midnight UTC of the booking's calendar day
// (new Date("YYYY-MM-DD")), so "today" must be the UK calendar date turned
// into that same form — not new Date().setHours(0), which depends on the
// server's timezone.
function ukToday(): Date {
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date())
  return new Date(ymd)
}

export default async function GarageOwnerHome({ userId, firstName }: { userId: string; firstName?: string }) {
  const ctx = await getGarageOwnerContext(userId)

  // Signed up as a garage owner but never finished adding the garage
  if (!ctx?.garageId) {
    return (
      <>
        <Navbar role="garage_owner" />
        <main style={{ maxWidth: 900, margin: "0 auto", padding: "80px 32px" }}>
          <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
            <h1 style={{ ...serif, fontSize: "1.4rem", marginBottom: 10 }}>Set up your garage</h1>
            <p style={{ color: "#6b6a66", marginBottom: 28, lineHeight: 1.6, fontSize: "0.95rem" }}>
              Add your garage details to start taking bookings online.
            </p>
            <Link href="/onboarding" style={primaryBtn}>Finish setup</Link>
          </div>
        </main>
        <FycaFooter />
      </>
    )
  }

  const garageId = ctx.garageId
  const today = ukToday()
  const weekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [garage, pending, bookedToday, comingUp, walkIns, parts, completed] = await Promise.all([
    prisma.garage.findUnique({ where: { id: garageId }, select: { name: true, logoUrl: true, description: true } }),
    prisma.booking.count({ where: { garageId, status: "pending", date: { gte: today } } }),
    prisma.booking.count({ where: { garageId, status: "confirmed", date: today } }),
    prisma.booking.count({ where: { garageId, status: "confirmed", date: { gt: today, lte: weekAhead } } }),
    prisma.booking.count({ where: { garageId, isWalkIn: true } }),
    prisma.part.count({ where: { garageId } }),
    prisma.booking.count({ where: { garageId, status: "completed" } }),
  ])

  const steps: Step[] = [
    {
      done: !!garage?.logoUrl,
      label: "Add your logo",
      why: "Makes your listing and booking page instantly recognisable.",
      href: "/garage-dashboard/settings", cta: "Upload logo",
    },
    {
      done: !!garage?.description?.trim(),
      label: "Write a short description",
      why: "Tell drivers what you’re known for — it also appears when your link is shared.",
      href: "/garage-dashboard/settings", cta: "Add description",
    },
    {
      done: !!ctx.hasServices,
      label: "List your services and prices",
      why: "Customers book faster when they can see what you do and what it costs.",
      href: "/garage-dashboard/settings", cta: "Add services",
    },
    {
      done: !!ctx.hasAvailability,
      label: "Set your opening hours",
      why: "Customers can only book times you’ve opened up.",
      href: "/garage-dashboard/availability", cta: "Set hours",
    },
    {
      done: walkIns > 0,
      label: "Add phone and walk-in bookings too",
      why: "Keep your whole diary in Fyca so nothing gets double-booked.",
      href: "/garage-dashboard", cta: "Add a booking",
    },
    {
      done: completed > 0,
      label: "Mark finished jobs as completed",
      why: "Lets the customer leave you a review and counts towards your monthly figures.",
      href: "/garage-dashboard", cta: "View bookings",
    },
    {
      done: parts > 0,
      label: "Track your parts stock",
      why: "See what’s running low before it holds up a job.",
      href: "/garage-dashboard/inventory", cta: "Add parts",
    },
  ]
  const doneCount = steps.filter(s => s.done).length

  return (
    <>
      <Navbar role="garage_owner" />

      {/* Hero */}
      <section className="sect-hero" style={{ padding: "56px 32px 40px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: "0.82rem", fontWeight: 500, color: "#6b6a66", marginBottom: 10 }}>
            Welcome back{firstName ? `, ${firstName}` : ""}
          </p>
          <h1 style={{ ...serif, fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 12 }}>
            {garage?.name ?? "Your garage"}
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "1rem", lineHeight: 1.6, marginBottom: 24, maxWidth: 520 }}>
            Here’s what needs you today, and how to get the most out of Fyca.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link href="/garage-dashboard" style={primaryBtn}>Go to dashboard →</Link>
            <Link href="/garage-dashboard/calendar" style={ghostBtn}>Calendar</Link>
            {ctx.trialDaysLeft != null && (
              <span style={{ fontSize: "0.82rem", color: "#6b6a66", marginLeft: 4 }}>
                {ctx.trialDaysLeft} {ctx.trialDaysLeft === 1 ? "day" : "days"} left of your free trial
              </span>
            )}
          </div>
        </div>
      </section>

      <main className="page-body" style={{ maxWidth: 964, margin: "0 auto", padding: "40px 32px 64px" }}>
        {!ctx.isLive && (
          <div style={{ background: "#fffbeb", border: "0.5px solid rgba(146,64,14,0.25)", borderRadius: 14, padding: "18px 22px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: "0.92rem", color: "#111110", margin: "0 0 2px" }}>Your garage isn’t live yet</p>
              <p style={{ fontSize: "0.85rem", color: "#6b6a66", margin: 0 }}>
                {ctx.hasServices && ctx.hasAvailability
                  ? "You’ve done your part — we’re reviewing your listing."
                  : "Add your services and opening hours so customers can book you."}
              </p>
            </div>
            <Link href="/garage-dashboard" style={primaryBtn}>Finish setup</Link>
          </div>
        )}

        {/* At a glance */}
        <p style={eyebrow}>At a glance</p>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 36 }}>
          <Stat value={pending} label={pending === 1 ? "Request to review" : "Requests to review"} highlight={pending > 0} />
          <Stat value={bookedToday} label="Booked in today" />
          <Stat value={comingUp} label="Booked in the next 7 days" />
        </div>

        {/* Booking link — only once the public page actually works */}
        {ctx.isLive && (
          <>
            <p style={eyebrow}>Your booking link</p>
            <ShareProfileCard garageId={garageId} />
          </>
        )}

        {/* Make the most of Fyca */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
          <h2 style={{ ...serif, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>Make the most of Fyca</h2>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#6b6a66" }}>{doneCount} of {steps.length} done</span>
        </div>
        <div style={{ height: 4, background: "#eceae4", borderRadius: 100, margin: "8px 0 18px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(doneCount / steps.length) * 100}%`, background: "#111110", borderRadius: 100 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Unfinished first, so the next thing to do is always at the top */}
          {[...steps.filter(s => !s.done), ...steps.filter(s => s.done)].map(s => <StepRow key={s.label} {...s} />)}
        </div>

        {/* Why Fyca — the payoff, so the checklist above feels worth doing */}
        <p style={{ ...eyebrow, marginTop: 56 }}>Why Fyca</p>
        <h2 style={{ ...serif, fontSize: "1.3rem", letterSpacing: "-0.02em", marginBottom: 18 }}>What Fyca does for your garage</h2>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {ADVANTAGES.map(({ title, body, href }, i) => (
            <Link key={title} href={href} style={{
              display: "flex", flexDirection: "column", gap: 8, textDecoration: "none",
              background: i === 0 ? "#111110" : "#f4f3ef", borderRadius: 14, padding: "22px 22px 24px",
            }}>
              <p style={{ ...serif, fontSize: "1.02rem", lineHeight: 1.25, margin: 0, color: i === 0 ? "#ffffff" : "#111110" }}>{title}</p>
              <p style={{ fontSize: "0.86rem", lineHeight: 1.6, margin: 0, color: i === 0 ? "rgba(255,255,255,0.7)" : "#444441" }}>{body}</p>
            </Link>
          ))}
        </div>
      </main>

      <FycaFooter />
    </>
  )
}

// Only claims Fyca actually delivers today — each card links to where it lives.
const ADVANTAGES = [
  {
    title: "Bookings while you’re under a car",
    body: "Customers book online from your link, day or night. No phone ringing mid-job and no missed enquiries.",
    href: "/garage-dashboard",
  },
  {
    title: "Bin the paper diary",
    body: "Online, phone and walk-in bookings sit in one diary you can check from anywhere.",
    href: "/garage-dashboard/calendar",
  },
  {
    title: "Accept in one click",
    body: "You get an email the moment someone books. Accept or decline and the customer is told straight away.",
    href: "/garage-dashboard",
  },
  {
    title: "Fewer no-shows",
    body: "Customers get an automatic reminder email the day before their booking.",
    href: "/garage-dashboard",
  },
  {
    title: "Parts ready before the car arrives",
    body: "Track your stock and get AI predictions of the parts you’ll need, so cars are turned round faster.",
    href: "/garage-dashboard/insights",
  },
  {
    title: "Know your numbers",
    body: "See completed jobs and revenue for the month, and build up reviews from happy customers.",
    href: "/garage-dashboard",
  },
]

type Step = { done: boolean; label: string; why: string; href: string; cta: string }

function StepRow({ done, label, why, href, cta }: Step) {
  return (
    <div style={{
      display: "flex", alignItems: "center", flexWrap: "wrap", gap: 14, padding: "16px 20px", borderRadius: 12,
      background: done ? "#f4f3ef" : "#ffffff",
      border: `0.5px solid ${done ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.12)"}`,
      opacity: done ? 0.7 : 1,
    }}>
      <div role="img" aria-label={done ? "Done" : "Not done yet"} style={{
        width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
        background: done ? "#111110" : "transparent", border: done ? "none" : "1.5px solid #d1d0cb",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {done && <span style={{ color: "#ffffff", fontSize: "0.6rem", fontWeight: 700 }}>✓</span>}
      </div>
      {/* flex-basis 220px: on narrow screens the button wraps underneath
          instead of squeezing the text into a thin column */}
      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "0.92rem", color: "#111110", margin: "0 0 2px" }}>
          {label}
        </p>
        <p style={{ fontSize: "0.84rem", color: "#6b6a66", margin: 0, lineHeight: 1.5 }}>{why}</p>
      </div>
      {!done && <Link href={href} style={{ ...primaryBtn, padding: "7px 16px", fontSize: "0.8rem", flexShrink: 0, marginLeft: "auto" }}>{cta}</Link>}
    </div>
  )
}

function Stat({ value, label, highlight = false }: { value: number; label: string; highlight?: boolean }) {
  return (
    <Link href="/garage-dashboard" style={{
      display: "block", textDecoration: "none", borderRadius: 14, padding: "20px 22px",
      background: highlight ? "#111110" : "#f4f3ef",
    }}>
      <p style={{ ...serif, fontSize: "2rem", lineHeight: 1, margin: "0 0 8px", color: highlight ? "#ffffff" : "#111110" }}>{value}</p>
      <p style={{ fontSize: "0.85rem", fontWeight: 500, margin: 0, color: highlight ? "rgba(255,255,255,0.75)" : "#444441" }}>{label}</p>
    </Link>
  )
}

const serif: React.CSSProperties = {
  fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, color: "#111110",
}
const eyebrow: React.CSSProperties = {
  fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 12,
}
const primaryBtn: React.CSSProperties = {
  display: "inline-block", background: "#111110", color: "#ffffff", padding: "10px 22px", borderRadius: 100,
  fontWeight: 600, fontSize: "0.88rem", textDecoration: "none", whiteSpace: "nowrap",
}
const ghostBtn: React.CSSProperties = {
  ...primaryBtn, background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.25)",
}
