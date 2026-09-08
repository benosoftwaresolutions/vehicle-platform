import Navbar from "@/app/components/Navbar"
import FycaFooter from "@/app/components/FycaFooter"
import { auth } from "@clerk/nextjs/server"
import { getCachedUser } from "@/app/lib/cache"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — Fyca",
  description: "The terms that govern your use of Fyca.",
}

/*
 * DRAFT — placeholder copy, not legally reviewed.
 * Every section below is holder text pending sign-off. Search this file
 * for "CONFIRM" to find each open item.
 */

export default async function TermsPage() {
  const { userId } = await auth()
  const user = userId ? await getCachedUser(userId) : null

  return (
    <>
      <Navbar role={user?.role} />

      <section style={{ padding: "80px 24px 64px", background: "#ffffff", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#444441", marginBottom: 20 }}>
            Legal
          </p>
          <h1 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(36px,5vw,56px)",
            letterSpacing: "-0.03em", lineHeight: 1.06,
            color: "#111110", marginBottom: 16, maxWidth: 560,
          }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#6b6a66" }}>Last updated: 8 August 2026</p>
          {/* CONFIRM: draft banner — remove once legal has signed off and this is no longer placeholder copy */}
          <p style={{
            marginTop: 16, display: "inline-block",
            background: "#fef3c7", color: "#92400e",
            fontSize: "0.8rem", fontWeight: 600,
            padding: "6px 14px", borderRadius: 100,
          }}>
            Draft — pending legal review
          </p>
        </div>
      </section>

      <section style={{ padding: "64px 24px 80px", background: "#ffffff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>

          <PolicySection title="Who we are">
            {/* CONFIRM: company legal name, registered address, company number */}
            <p>Fyca (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website and service at <strong>fyca.co.uk</strong> (the &ldquo;Service&rdquo;). By creating an account or using the Service, you agree to these Terms of Service.</p>
          </PolicySection>

          <PolicySection title="Acceptance of terms">
            {/* CONFIRM: minimum age requirement for account creation */}
            <p>By signing up for or using Fyca, you confirm that you have read, understood, and agree to be bound by these Terms and our <a href="/privacy" style={{ color: "#111110" }}>Privacy Policy</a>. If you do not agree, you must not use the Service.</p>
          </PolicySection>

          <PolicySection title="The service">
            <p>Fyca is a booking platform that connects vehicle owners (&ldquo;drivers&rdquo;) with independent garages (&ldquo;garages&rdquo;) for vehicle servicing, repairs, and related work. Fyca facilitates the booking relationship between drivers and garages but is not itself a party to, and does not perform, any vehicle servicing or repair work.</p>
          </PolicySection>

          <PolicySection title="Accounts">
            <p>You must provide accurate and complete information when creating an account and keep it up to date. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.</p>
          </PolicySection>

          <PolicySection title="Garage obligations">
            {/* CONFIRM: specific garage obligations — insurance requirements, trade certifications, standards of work */}
            <p>Garages using Fyca to list their business are responsible for the accuracy of their listing, the services they offer, and the quality of work performed. Garages must hold any licences, certifications, and insurance required by law to carry out the work they list.</p>
          </PolicySection>

          <PolicySection title="Driver obligations">
            <p>Drivers are responsible for the accuracy of information provided when making a booking, including vehicle details and contact information, and for being available at the agreed appointment time or providing reasonable notice of cancellation.</p>
          </PolicySection>

          <PolicySection title="Bookings and cancellations">
            {/* CONFIRM: cancellation window / no-show policy — how many hours' notice, any fees */}
            <p>Bookings made through Fyca are agreements between the driver and the garage. Fyca is not responsible for delays, cancellations, or disputes arising from the appointment itself, though we may assist in facilitating communication between parties.</p>
          </PolicySection>

          <PolicySection title="Fees and subscriptions">
            {/* CONFIRM: garage subscription pricing, trial length, refund policy */}
            <p>Garage accounts may be subject to a subscription fee to list on the platform, as described at the time of sign-up. Fees are billed in advance and are non-refundable except where required by law.</p>
          </PolicySection>

          <PolicySection title="Prohibited conduct">
            <p>You agree not to misuse the Service, including by submitting false information, attempting to circumvent the platform to avoid fees, harassing other users, or using the Service for any unlawful purpose.</p>
          </PolicySection>

          <PolicySection title="Disclaimers and limitation of liability">
            {/* CONFIRM: liability cap / disclaimer wording — needs solicitor sign-off */}
            <p>The Service is provided &ldquo;as is&rdquo;. Fyca does not guarantee the quality, safety, or legality of work performed by garages listed on the platform. To the fullest extent permitted by law, Fyca&apos;s liability for any claim arising from your use of the Service is limited.</p>
          </PolicySection>

          <PolicySection title="Termination">
            <p>We may suspend or terminate your account if you breach these Terms. You may close your account at any time by contacting us.</p>
          </PolicySection>

          <PolicySection title="Changes to these terms">
            <p>We may update these Terms from time to time. We will notify registered users of material changes by email. Continued use of Fyca after changes constitutes acceptance of the updated Terms.</p>
          </PolicySection>

          <PolicySection title="Governing law">
            {/* CONFIRM: governing law / jurisdiction clause */}
            <p>These Terms are governed by the laws of England and Wales.</p>
          </PolicySection>

          <PolicySection title="Contact">
            {/* CONFIRM: contact email for legal/terms queries */}
            <p>For any questions about these Terms, contact us at <a href="mailto:hello@fyca.co.uk" style={{ color: "#111110" }}>hello@fyca.co.uk</a>.</p>
          </PolicySection>

        </div>
      </section>

      <FycaFooter />
    </>
  )
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 40 }}>
      <h2 style={{
        fontFamily: "var(--font-fraunces),'Fraunces',serif",
        fontWeight: 600, fontSize: "1.25rem",
        letterSpacing: "-0.02em", color: "#111110", marginBottom: 16,
      }}>{title}</h2>
      <div style={{ color: "#444441", fontSize: "0.95rem", lineHeight: 1.8, display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  )
}
