import Navbar from "@/app/components/Navbar"
import DryvnFooter from "@/app/components/DryvnFooter"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — Fyca",
  description: "How Fyca collects, uses, and protects your personal data.",
}

export default async function PrivacyPage() {
  const { userId } = await auth()
  const user = userId
    ? await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } })
    : null

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
            Privacy Policy
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#6b6a66" }}>Last updated: 27 April 2026</p>
        </div>
      </section>

      <section style={{ padding: "64px 24px 80px", background: "#ffffff" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 48 }}>

          <PolicySection title="Who we are">
            <p>Fyca (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a vehicle booking platform operated from the United Kingdom. Our website is <strong>fyca.co.uk</strong>. If you have questions about this policy, contact us at <a href="mailto:privacy@fyca.co.uk" style={{ color: "#111110" }}>privacy@fyca.co.uk</a>.</p>
          </PolicySection>

          <PolicySection title="What data we collect">
            <p>We collect the following categories of personal data:</p>
            <ul>
              <li><strong>Account data</strong> — your name and email address, collected when you sign up via Clerk.</li>
              <li><strong>Booking data</strong> — vehicle registration, service type, date and time of appointment.</li>
              <li><strong>Garage data</strong> — if you register as a garage owner: your garage name, address, phone number, and email.</li>
              <li><strong>Usage data</strong> — anonymised analytics about how you use the site (via Vercel Analytics). No cookies are used for tracking.</li>
            </ul>
          </PolicySection>

          <PolicySection title="How we use your data">
            <p>We use your data to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Process and confirm bookings between drivers and garages</li>
              <li>Send transactional emails (booking confirmations, updates, and notifications)</li>
              <li>Improve the platform through anonymised usage analytics</li>
            </ul>
            <p>We do not sell your data. We do not use your data for advertising.</p>
          </PolicySection>

          <PolicySection title="Legal basis for processing">
            <p>We process your personal data under the following lawful bases (UK GDPR):</p>
            <ul>
              <li><strong>Contract</strong> — processing necessary to provide the booking service you signed up for.</li>
              <li><strong>Legitimate interests</strong> — anonymised analytics to improve the platform.</li>
              <li><strong>Legal obligation</strong> — where we are required to retain records by law.</li>
            </ul>
          </PolicySection>

          <PolicySection title="Who we share data with">
            <p>We use trusted third-party service providers to operate the platform. These providers act as data processors on our behalf and are contractually bound to process your data only on our instructions. They fall into the following categories:</p>
            <ul>
              <li><strong>Authentication</strong> — managing user accounts and sign-in.</li>
              <li><strong>Email delivery</strong> — sending transactional emails such as booking confirmations.</li>
              <li><strong>Database hosting</strong> — secure storage of booking and account data.</li>
              <li><strong>File storage</strong> — hosting images uploaded by garage owners.</li>
              <li><strong>Website hosting and analytics</strong> — serving the platform and collecting anonymised usage data.</li>
            </ul>
            <p>All providers are either based in the UK or EEA, or operate under appropriate safeguards for international data transfers (such as UK Standard Contractual Clauses). We do not sell your data to any third party.</p>
          </PolicySection>

          <PolicySection title="How long we keep your data">
            <p>We retain your account data for as long as your account is active. If you delete your account, we remove your personal data within 30 days, except where we are required to retain it for legal purposes.</p>
            <p>Booking records are retained for 2 years for operational and legal reasons.</p>
          </PolicySection>

          <PolicySection title="Your rights">
            <p>Under UK GDPR you have the right to:</p>
            <ul>
              <li><strong>Access</strong> the personal data we hold about you</li>
              <li><strong>Correct</strong> inaccurate data</li>
              <li><strong>Delete</strong> your data (right to erasure)</li>
              <li><strong>Restrict</strong> or object to processing</li>
              <li><strong>Data portability</strong> — receive your data in a machine-readable format</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:privacy@fyca.co.uk" style={{ color: "#111110" }}>privacy@fyca.co.uk</a>. We will respond within 30 days.</p>
            <p>You also have the right to lodge a complaint with the <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: "#111110" }}>Information Commissioner&apos;s Office (ICO)</a>.</p>
          </PolicySection>

          <PolicySection title="Cookies">
            <p>We use only essential cookies required for authentication (set by Clerk). We do not use advertising or tracking cookies. Our analytics (Vercel) are cookieless and anonymous.</p>
          </PolicySection>

          <PolicySection title="Changes to this policy">
            <p>We may update this policy from time to time. We will notify registered users of material changes by email. Continued use of Fyca after changes constitutes acceptance of the updated policy.</p>
          </PolicySection>

          <PolicySection title="Contact">
            <p>For any privacy-related questions, contact us at <a href="mailto:privacy@fyca.co.uk" style={{ color: "#111110" }}>privacy@fyca.co.uk</a>.</p>
          </PolicySection>

        </div>
      </section>

      <DryvnFooter />
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
