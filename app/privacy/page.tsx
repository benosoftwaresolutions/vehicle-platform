import Navbar from "@/app/components/Navbar"
import FycaFooter from "@/app/components/FycaFooter"
import type { Metadata } from "next"
import { pageMetadata } from "@/app/lib/seo"
import { COMPANY, hasLegalIdentity } from "@/app/lib/company"

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Fyca collects, uses, and protects your personal data.",
  path: "/privacy",
})

export default function PrivacyPage() {

  return (
    <>
      <Navbar />

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
            Privacy Policy
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#6b6a66" }}>Last updated: 27 October 2026</p>
        </div>
      </section>

      <section style={{ padding: "64px 24px 80px", background: "#ffffff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>

          <PolicySection title="Who we are">
            <p>Fyca (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a vehicle booking platform operated from the United Kingdom at <strong>{COMPANY.website}</strong>.{hasLegalIdentity && <> The data controller is <strong>{COMPANY.legalName}</strong>{COMPANY.companyNumber && <> (company no. {COMPANY.companyNumber})</>}{COMPANY.address && <>, {COMPANY.address}</>}.</>} If you have questions about this policy, contact us at <a href={`mailto:${COMPANY.privacyEmail}`} style={{ color: "#111110" }}>{COMPANY.privacyEmail}</a>.</p>
          </PolicySection>

          <PolicySection title="What data we collect">
            <ul>
              <li><strong>Account data</strong> — your name, email address and, if you give it, phone number. Sign-in is handled by our authentication provider, Clerk.</li>
              <li><strong>Vehicle data</strong> — registration, make, model, year, and the MOT and service dates you add.</li>
              <li><strong>Booking data</strong> — the garage, service, date and time, any notes you add, and messages between you and the garage.</li>
              <li><strong>Garage data</strong> — if you register a garage: the business name, address, phone number, email, logo, availability, parts inventory and the owner&rsquo;s name.</li>
              <li><strong>Notes kept by garages</strong> — garages can keep their own notes against a vehicle registration, and can add walk-in bookings with a customer&rsquo;s name, phone number and email.</li>
              <li><strong>Reviews</strong> — the rating and comment you leave for a garage.</li>
              <li><strong>Payment data</strong> — if you subscribe, payments are handled by Stripe. We receive your subscription status and a customer reference, never your full card details.</li>
              <li><strong>Usage data</strong> — anonymous, aggregated analytics about how the site is used (Vercel Analytics). This uses no cookies and does not identify you.</li>
            </ul>
          </PolicySection>

          <PolicySection title="How we use your data, and our legal basis">
            <ul>
              <li><strong>To provide the service</strong> (contract) — creating your account, sending your booking to the garage, and sending booking emails such as confirmations, changes, reminders before your appointment and &ldquo;your car is ready&rdquo;.</li>
              <li><strong>MOT and service reminders</strong> (legitimate interests) — emails before the MOT or service dates you have entered. You can turn these off at any time using the unsubscribe link in every reminder.</li>
              <li><strong>Subscriptions and payments</strong> (contract, and legal obligation for tax records).</li>
              <li><strong>Running a safe, reliable service</strong> (legitimate interests) — preventing abuse and spam (including rate-limiting by IP address), fixing problems, and anonymous analytics.</li>
              <li><strong>AI parts predictions for garages</strong> (legitimate interests) — a garage&rsquo;s parts inventory and its garage name are sent to our AI provider, Anthropic, to predict which parts it will need. No driver or customer details are sent.</li>
            </ul>
            <p>We do not sell your data, and we do not use it for advertising.</p>
          </PolicySection>

          <PolicySection title="Sharing with garages">
            <p>When you book, we share your name, email address, vehicle registration and booking details with the garage you chose, so it can carry out the work and contact you. The garage then uses those details for its own business as a separate data controller and is responsible for handling them lawfully. Our terms require garages to use them only for your booking and their customer relationship with you.</p>
          </PolicySection>

          <PolicySection title="Our service providers">
            <p>These providers process data on our behalf, under contracts that require them to protect it and use it only on our instructions:</p>
            <ul>
              <li><strong>Clerk</strong> — accounts and sign-in</li>
              <li><strong>Neon</strong> — database hosting</li>
              <li><strong>Vercel</strong> — website hosting and anonymous analytics</li>
              <li><strong>Resend</strong> — sending emails</li>
              <li><strong>Stripe</strong> — subscription payments</li>
              <li><strong>UploadThing</strong> — storing garage logos</li>
              <li><strong>Upstash</strong> — rate-limiting to prevent abuse</li>
              <li><strong>Anthropic</strong> — AI parts predictions for garages (garage inventory only)</li>
            </ul>
            <p>Some of these providers process data outside the UK, including in the United States. Where they do, we rely on appropriate safeguards such as the UK International Data Transfer Addendum or the UK&ndash;US data bridge.</p>
          </PolicySection>

          <PolicySection title="How long we keep your data">
            <p>We keep your account and vehicle data while your account is open. If you close your account, we delete your personal data within 30 days, except where we need to keep it for legal reasons.</p>
            <p>Booking records are kept for 2 years. Payment and invoice records are kept for 6 years to meet tax law.</p>
          </PolicySection>

          <PolicySection title="Your rights">
            <p>Under UK GDPR you have the right to:</p>
            <ul>
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Correct</strong> inaccurate data</li>
              <li><strong>Delete</strong> your data (right to erasure)</li>
              <li><strong>Restrict</strong> or <strong>object to</strong> processing, including MOT and service reminders</li>
              <li><strong>Data portability</strong> — receive your data in a machine-readable format</li>
            </ul>
            <p>To use any of these rights, email us at <a href={`mailto:${COMPANY.privacyEmail}`} style={{ color: "#111110" }}>{COMPANY.privacyEmail}</a>. We will respond within one month.</p>
            <p>You also have the right to complain to the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: "#111110" }}>Information Commissioner&apos;s Office (ICO)</a>.</p>
          </PolicySection>

          <PolicySection title="Cookies">
            <p>We use only essential cookies, needed to keep you signed in (set by Clerk). We do not use advertising or tracking cookies. Our analytics are cookieless and anonymous, so there is no cookie banner.</p>
          </PolicySection>

          <PolicySection title="Age">
            <p>Fyca is for adults. You must be 18 or over to create an account, and we do not knowingly collect data from children.</p>
          </PolicySection>

          <PolicySection title="Changes to this policy">
            <p>We may update this policy from time to time. We will email registered users about material changes.</p>
          </PolicySection>

          <PolicySection title="Contact">
            <p>For any privacy questions, contact us at <a href={`mailto:${COMPANY.privacyEmail}`} style={{ color: "#111110" }}>{COMPANY.privacyEmail}</a>.</p>
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
