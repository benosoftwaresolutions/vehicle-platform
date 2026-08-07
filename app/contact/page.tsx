import Navbar from "@/app/components/Navbar"
import FycaFooter from "@/app/components/FycaFooter"
import { auth } from "@clerk/nextjs/server"
import { getCachedUser } from "@/app/lib/cache"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact — Fyca",
  description: "Get in touch with the Fyca team. We're here to help drivers and garage owners.",
}

export default async function ContactPage() {
  const { userId } = await auth()
  const user = userId ? await getCachedUser(userId) : null

  return (
    <>
      <Navbar role={user?.role} />

      <section style={{ padding: "80px 24px 64px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444441", marginBottom: 20 }}>
            Contact
          </p>
          <h1 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(36px,5vw,56px)",
            letterSpacing: "-0.03em", lineHeight: 1.06,
            color: "#111110", marginBottom: 24, maxWidth: 560,
          }}>
            We&apos;re here to help
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#6b6a66", maxWidth: 480, lineHeight: 1.7 }}>
            Whether you&apos;re a driver with a question or a garage owner looking to get listed, we&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="sect" style={{ padding: "72px 24px", background: "#f4f3ef" }}>
        <div className="grid-2" style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>

          {/* Contact options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              {
                title: "General enquiries",
                body: "Questions about Fyca, bookings, or how the platform works.",
                contact: "hello@fyca.co.uk",
              },
              {
                title: "Garage owners",
                body: "Looking to list your garage or need help with your account?",
                contact: "garages@fyca.co.uk",
              },
              {
                title: "Support",
                body: "Having trouble with a booking or need technical help?",
                contact: "support@fyca.co.uk",
              },
            ].map(({ title, body, contact }) => (
              <div key={title} style={{ background: "#ffffff", borderRadius: 14, padding: "24px", border: "0.5px solid rgba(0,0,0,0.06)" }}>
                <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1rem", color: "#111110", marginBottom: 6 }}>{title}</p>
                <p style={{ color: "#6b6a66", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 14 }}>{body}</p>
                <a href={`mailto:${contact}`} style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111110", textDecoration: "none", borderBottom: "0.5px solid rgba(0,0,0,0.2)", paddingBottom: 1 }}>
                  {contact}
                </a>
              </div>
            ))}
          </div>

          {/* Response info */}
          <div style={{ background: "#111110", borderRadius: 20, padding: "36px 32px" }}>
            <h2 style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600, fontSize: "1.4rem",
              letterSpacing: "-0.025em", color: "#ffffff", marginBottom: 16,
            }}>
              What to expect
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "Response time", value: "We aim to reply within one business day." },
                { label: "Hours", value: "Mon – Fri, 9am – 5pm GMT." },
                { label: "Garages", value: "If you want to list your garage, start at fyca.co.uk/for-garages — it takes 3 minutes." },
              ].map(({ label, value }) => (
                <div key={label} style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)", paddingBottom: 20 }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{label}</p>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <FycaFooter />
    </>
  )
}
