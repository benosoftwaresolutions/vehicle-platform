import Navbar from "@/app/components/Navbar"
import FycaFooter from "@/app/components/FycaFooter"
import type { Metadata } from "next"
import { pageMetadata } from "@/app/lib/seo"
import { COMPANY, hasLegalIdentity } from "@/app/lib/company"

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms that govern your use of Fyca.",
  path: "/terms",
})

export default function TermsPage() {

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
            Terms of Service
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#6b6a66" }}>Last updated: 27 October 2026</p>
        </div>
      </section>

      <section style={{ padding: "64px 24px 80px", background: "#ffffff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>

          {/*
            Written to standard UK positions for a booking platform. Not a
            substitute for a solicitor's review — in particular the liability
            section. Prices here must match /pricing and Stripe.
          */}

          <PolicySection title="Who we are">
            <p>Fyca (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website and service at <strong>{COMPANY.website}</strong> (the &ldquo;Service&rdquo;).{hasLegalIdentity && <> Fyca is operated by <strong>{COMPANY.legalName}</strong>{COMPANY.companyNumber && <>, registered in England and Wales with company number {COMPANY.companyNumber}</>}{COMPANY.address && <>, of {COMPANY.address}</>}.</>}{COMPANY.vatNumber && <> Our VAT number is {COMPANY.vatNumber}.</>}</p>
            <p>By creating an account or using the Service, you agree to these Terms of Service and our <a href="/privacy" style={{ color: "#111110" }}>Privacy Policy</a>. If you do not agree, you must not use the Service.</p>
          </PolicySection>

          <PolicySection title="Who can use Fyca">
            <p>You must be at least 18 years old to create an account. Driver accounts are for personal use. Garage accounts must be opened by the owner of the garage business or someone authorised to act for it.</p>
          </PolicySection>

          <PolicySection title="The service">
            <p>Fyca is a booking platform that connects vehicle owners (&ldquo;drivers&rdquo;) with independent garages (&ldquo;garages&rdquo;) for vehicle servicing, repairs, MOTs and related work. Fyca facilitates the booking but is not a party to, and does not carry out, any work on your vehicle. The contract for the work is between you and the garage.</p>
            <p>MOT and service reminders are provided for convenience. They depend on the dates you enter and may not always be sent. You remain responsible for keeping your vehicle taxed, insured and with a valid MOT.</p>
          </PolicySection>

          <PolicySection title="Accounts">
            <p>You must provide accurate and complete information and keep it up to date. You are responsible for keeping your sign-in details confidential and for all activity under your account.</p>
          </PolicySection>

          <PolicySection title="Garage obligations">
            <p>Garages are responsible for the accuracy of their listing, prices, availability and opening hours, and for the quality and safety of the work they carry out. Garages must hold all licences, approvals (including MOT testing authorisation where MOTs are offered) and insurance required by law for the work they list, and must comply with consumer law in their dealings with drivers.</p>
            <p>When a driver books, we share their name, contact details, vehicle registration and booking details with the garage. The garage may use this information only to deliver and follow up on that booking and its own customer relationship, and must handle it in line with UK data protection law. Garages are responsible for any notes they keep about their customers.</p>
            <p>By uploading a logo or other content, a garage confirms it owns that content or has permission to use it, and gives Fyca a licence to display it on the Service for as long as the listing is live.</p>
          </PolicySection>

          <PolicySection title="Driver obligations">
            <p>Drivers are responsible for the accuracy of the information they provide when booking, including vehicle and contact details, and for turning up at the agreed time or cancelling in good time.</p>
          </PolicySection>

          <PolicySection title="Bookings and cancellations">
            <p>A booking request is not confirmed until the garage accepts it. Fyca does not charge drivers a booking fee. You can cancel a booking through the Fyca app at any time at no charge from Fyca. Any charges for the work itself, or for late cancellations or no-shows, are set by the garage, and the garage must tell you about them directly.</p>
            <p>Fyca is not responsible for delays, cancellations or disputes arising from the appointment or the work, but we will help pass messages between you and the garage where we can.</p>
          </PolicySection>

          <PolicySection title="Pro Vehicle Owner subscription (drivers)">
            <p>Pro Vehicle Owner costs <strong>£7 per month</strong>{COMPANY.vatRegistered ? ", including VAT" : ""}. It is billed monthly in advance through our payment provider, Stripe, and <strong>renews automatically each month until you cancel</strong>.</p>
            <p>You can cancel at any time from &ldquo;Manage billing&rdquo; in your account. Cancellation stops future payments and your Pro features continue until the end of the month you have paid for.</p>
            <p><strong>14-day right to cancel.</strong> You can cancel within 14 days of first subscribing and get a refund. Because Pro starts as soon as you subscribe, at your request, we may deduct a proportionate amount for the days you had it. To cancel within this period, cancel from &ldquo;Manage billing&rdquo; and email <a href={`mailto:${COMPANY.supportEmail}`} style={{ color: "#111110" }}>{COMPANY.supportEmail}</a> asking for a refund. Nothing in these terms affects your statutory rights.</p>
          </PolicySection>

          <PolicySection title="Garage Pro subscription (garages)">
            <p>Garage Pro costs <strong>£99.99 per month</strong>{COMPANY.vatRegistered ? ", including VAT" : ""}. New garages get a 30-day free trial, starting on the day the garage is approved and goes live. A payment method is needed to keep taking bookings after the trial. Unless you cancel before the trial ends, you will be billed automatically when it ends, then <strong>monthly in advance until you cancel</strong>.</p>
            <p>You can cancel at any time from &ldquo;Manage subscription&rdquo; in your dashboard. Cancellation takes effect at the end of the current billing month. Garage Pro is a business service, so payments for months already started are not refunded except where the law requires. We will give at least 30 days&rsquo; notice by email of any price change.</p>
          </PolicySection>

          <PolicySection title="Reviews and content">
            <p>Reviews must be honest and based on a genuine experience with the garage. We may remove reviews or other content that is false, offensive, unlawful or breaches these terms.</p>
          </PolicySection>

          <PolicySection title="Prohibited conduct">
            <p>You must not misuse the Service, including by submitting false information or bookings, posting fake reviews, attempting to bypass the platform to avoid fees, harassing other users, interfering with the Service&rsquo;s security, or using the Service for any unlawful purpose.</p>
          </PolicySection>

          <PolicySection title="Our liability">
            <p>Nothing in these terms limits or excludes our liability for death or personal injury caused by our negligence, for fraud, or for anything else that cannot be limited or excluded by law.</p>
            <p>Fyca provides the booking platform only. We are not responsible for the quality, safety, price or legality of work carried out by garages, which is the garage&rsquo;s responsibility under your contract with them.</p>
            <p><strong>If you are a driver:</strong> we are responsible for loss or damage you suffer that is a foreseeable result of our breaking these terms or failing to use reasonable care and skill. We are not responsible for loss that was not foreseeable. The Service is for domestic and private use, and we have no liability to drivers for any loss of profit, loss of business or business interruption.</p>
            <p><strong>If you are a garage:</strong> we are not liable for any loss of profit, revenue, business or goodwill, or any indirect or consequential loss. Our total liability to a garage in any 12-month period is limited to the subscription fees that garage paid us in that period.</p>
          </PolicySection>

          <PolicySection title="Suspension and closing your account">
            <p>We may suspend or close an account that breaches these terms, with notice where reasonable. You can close your account at any time by emailing <a href={`mailto:${COMPANY.supportEmail}`} style={{ color: "#111110" }}>{COMPANY.supportEmail}</a>. If you have a subscription, cancel it from your billing page first.</p>
          </PolicySection>

          <PolicySection title="Changes to these terms">
            <p>We may update these terms from time to time. We will email registered users about material changes at least 30 days before they take effect. If you do not agree to a change, you can close your account before it takes effect.</p>
          </PolicySection>

          <PolicySection title="Governing law">
            <p>These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction. If you are a driver living in Scotland or Northern Ireland, you can also bring proceedings in your local courts.</p>
          </PolicySection>

          <PolicySection title="Contact and complaints">
            <p>For questions or complaints about the Service or these terms, contact us at <a href={`mailto:${COMPANY.supportEmail}`} style={{ color: "#111110" }}>{COMPANY.supportEmail}</a>. We aim to respond within 5 working days.</p>
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
