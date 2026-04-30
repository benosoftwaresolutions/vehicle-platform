import Link from "next/link"
import Navbar from "@/app/components/Navbar"
import DryvnFooter from "@/app/components/DryvnFooter"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About — Fyca",
  description: "Fyca connects car owners with trusted local garages. Book online in seconds, no phone calls needed.",
}

export default async function AboutPage() {
  const { userId } = await auth()
  const user = userId
    ? await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } })
    : null

  return (
    <>
      <Navbar role={user?.role} />

      {/* Hero */}
      <section className="sect-hero" style={{ padding: "80px 24px 64px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444441", marginBottom: 20 }}>
            About
          </p>
          <h1 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(36px,5vw,56px)",
            letterSpacing: "-0.03em", lineHeight: 1.06,
            color: "#111110", marginBottom: 24, maxWidth: 640,
          }}>
            Fix Your Car Anywhere
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#6b6a66", maxWidth: 520, lineHeight: 1.7 }}>
            Fyca is a vehicle booking platform that connects car owners with trusted local garages. We make it easy to find the right garage, pick a time that works, and book online — no phone calls, no waiting.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="sect" style={{ padding: "72px 24px", background: "#f4f3ef" }}>
        <div className="grid-2" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444441", marginBottom: 14 }}>Our mission</p>
            <h2 style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600, fontSize: "clamp(24px,3vw,32px)",
              letterSpacing: "-0.025em", color: "#111110", marginBottom: 20,
            }}>
              Booking a garage should be as easy as ordering a taxi
            </h2>
            <p style={{ color: "#444441", fontSize: "0.95rem", lineHeight: 1.75 }}>
              For too long, getting your car serviced has meant phone calls during office hours, waiting on hold, and playing diary ping-pong. We built Fyca to fix that — for drivers and garages alike.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { title: "For drivers", body: "Search garages by service or location, read real reviews, see live availability, and book in seconds — any time of day." },
              { title: "For garages", body: "Fill your diary without lifting the phone. Accept bookings online, manage your schedule, and keep customers informed automatically." },
              { title: "Built for the UK", body: "We're focused on the UK market and the real needs of independent garages and everyday drivers." },
            ].map(({ title, body }) => (
              <div key={title} style={{ background: "#ffffff", borderRadius: 14, padding: "22px 24px", border: "0.5px solid rgba(0,0,0,0.06)" }}>
                <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1rem", color: "#111110", marginBottom: 8 }}>{title}</p>
                <p style={{ color: "#444441", fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="sect" style={{ padding: "72px 24px", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444441", marginBottom: 14 }}>What we stand for</p>
          <h2 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(24px,3vw,32px)",
            letterSpacing: "-0.025em", color: "#111110", marginBottom: 44,
          }}>
            Simple values, honest product
          </h2>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { title: "Transparency", body: "No hidden fees, no surprise charges. What you see is what you get." },
              { title: "Trust", body: "Every garage on Fyca is vetted. Real reviews from real customers." },
              { title: "Simplicity", body: "If it takes more than a minute to book, we've failed. We keep things fast and clear." },
            ].map(({ title, body }) => (
              <div key={title} style={{ background: "#f4f3ef", borderRadius: 14, padding: "26px 24px" }}>
                <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", marginBottom: 10 }}>{title}</p>
                <p style={{ color: "#444441", fontSize: "0.9rem", lineHeight: 1.65, margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sect" style={{ padding: "72px 24px", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ background: "#111110", borderRadius: 20, padding: "56px 52px", textAlign: "center" }}>
            <h2 style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600, fontSize: "clamp(24px,3vw,34px)",
              letterSpacing: "-0.025em", color: "#ffffff", marginBottom: 12,
            }}>
              Ready to get started?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", marginBottom: 32 }}>
              Find a garage near you, or list yours for free.
            </p>
            <div className="cta-row" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/garages" style={{ background: "#ffffff", color: "#111110", padding: "13px 28px", borderRadius: 100, fontWeight: 700, fontSize: "0.95rem", textDecoration: "none" }}>
                Find a garage
              </Link>
              <Link href="/for-garages" style={{ background: "transparent", color: "#ffffff", padding: "13px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", border: "0.5px solid rgba(255,255,255,0.3)" }}>
                List your garage
              </Link>
            </div>
          </div>
        </div>
      </section>

      <DryvnFooter />
    </>
  )
}
