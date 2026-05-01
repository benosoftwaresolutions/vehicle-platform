import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import Navbar from "@/app/components/Navbar"
import Link from "next/link"

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) return <NotSignedIn />

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { name: true, email: true, role: true, garageId: true, createdAt: true },
  })

  const clerkUser = await currentUser().catch(() => null)

  if (!dbUser) return <CompleteSetup />

  const isGarageOwner = dbUser.role === "garage_owner"

  const [garage, vehicles, bookingCount, confirmedCount] = await Promise.all([
    isGarageOwner && dbUser.garageId
      ? prisma.garage.findUnique({
          where: { id: dbUser.garageId },
          select: { name: true, city: true, postcode: true, address: true, rating: true, approved: true },
        }).catch(() => null)
      : null,
    !isGarageOwner
      ? prisma.vehicle.findMany({ where: { clerkId: userId }, orderBy: { createdAt: "desc" } }).catch(() => [])
      : [],
    isGarageOwner && dbUser.garageId
      ? prisma.booking.count({ where: { garageId: dbUser.garageId } }).catch(() => 0)
      : prisma.booking.count({ where: { clerkId: userId } }).catch(() => 0),
    isGarageOwner && dbUser.garageId
      ? prisma.booking.count({ where: { garageId: dbUser.garageId, status: "confirmed" } }).catch(() => 0)
      : prisma.booking.count({ where: { clerkId: userId, status: "confirmed" } }).catch(() => 0),
  ])

  const clerkName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ")
  const displayName = dbUser.name || clerkName || ""
  const displayEmail = dbUser.email || clerkUser?.emailAddresses?.[0]?.emailAddress || ""

  const initials = (displayName || displayEmail)
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase() || "?"

  const memberSince = new Date(dbUser.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })

  return (
    <>
      <Navbar role={dbUser.role} />

      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "56px 32px 40px", background: "#ffffff" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: 6 }}>
            My Profile
          </h1>
          <p style={{ color: "#6b6a66", fontSize: "0.95rem" }}>Your account overview and details</p>
        </div>
      </div>

      <main className="page-body" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div style={{ background: "#f4f3ef", borderRadius: 16, padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "#111110", color: "#ffffff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-fraunces),'Fraunces',serif",
                fontWeight: 700, fontSize: "1.4rem", flexShrink: 0,
              }}>
                {initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                  <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.35rem", letterSpacing: "-0.02em", color: "#111110", margin: 0 }}>
                    {displayName || "Your Name"}
                  </h2>
                  <span style={{
                    background: isGarageOwner ? "#111110" : "#eceae4",
                    color: isGarageOwner ? "#ffffff" : "#444441",
                    fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em",
                    padding: "3px 12px", borderRadius: 100, whiteSpace: "nowrap",
                  }}>
                    {isGarageOwner ? "Garage Owner" : "Driver"}
                  </span>
                </div>
                <p style={{ color: "#6b6a66", fontSize: "0.9rem", margin: "0 0 2px" }}>{displayEmail}</p>
                <p style={{ color: "#aaa9a4", fontSize: "0.8rem", margin: 0 }}>Member since {memberSince}</p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="grid-2">
            <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "22px 24px" }}>
              <p className="eyebrow" style={{ marginBottom: 8 }}>{isGarageOwner ? "Bookings Received" : "Bookings Made"}</p>
              <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontSize: "2rem", fontWeight: 600, color: "#111110", margin: 0, lineHeight: 1 }}>
                {bookingCount}
              </p>
            </div>
            <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "22px 24px" }}>
              <p className="eyebrow" style={{ marginBottom: 8 }}>Confirmed</p>
              <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontSize: "2rem", fontWeight: 600, color: "#111110", margin: 0, lineHeight: 1 }}>
                {confirmedCount}
              </p>
            </div>
          </div>

          {isGarageOwner && garage && (
            <div style={{ background: "#f4f3ef", borderRadius: 16, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", margin: 0 }}>Your Garage</h3>
                <span style={{
                  background: garage.approved ? "#111110" : "#eceae4",
                  color: garage.approved ? "#ffffff" : "#6b6a66",
                  fontSize: "0.75rem", fontWeight: 600, padding: "3px 12px", borderRadius: 100,
                }}>
                  {garage.approved ? "Approved" : "Pending Approval"}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                <Row label="Name" value={garage.name} />
                <Row label="Address" value={`${garage.address}, ${garage.city}, ${garage.postcode}`} />
                {garage.rating > 0 && <Row label="Rating" value={`${garage.rating} / 5`} />}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/garage-dashboard" className="btn-primary" style={{ fontSize: "0.875rem", padding: "10px 20px" }}>Go to Dashboard</Link>
                <Link href="/garage-dashboard/settings" className="btn-ghost" style={{ fontSize: "0.875rem", padding: "10px 20px" }}>Garage Settings</Link>
              </div>
            </div>
          )}

          {!isGarageOwner && (
            <div style={{ background: "#f4f3ef", borderRadius: 16, padding: "24px 28px" }}>
              <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", marginBottom: 20 }}>My Vehicles</h3>
              {vehicles.length === 0 ? (
                <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                  <p style={{ color: "#6b6a66", fontSize: "0.9rem", marginBottom: 16 }}>No vehicles saved yet. Your registration is saved when you book.</p>
                  <Link href="/garages" className="btn-primary" style={{ fontSize: "0.875rem", padding: "10px 20px" }}>Find a Garage</Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {vehicles.map((v) => (
                    <div key={v.id} style={{ background: "#ffffff", borderRadius: 10, padding: "14px 18px" }}>
                      <p style={{ fontWeight: 600, color: "#111110", margin: "0 0 2px", fontSize: "0.95rem" }}>{v.year} {v.make} {v.model}</p>
                      <p style={{ color: "#6b6a66", fontSize: "0.8rem", margin: 0, letterSpacing: "0.05em", fontWeight: 600 }}>{v.registration}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isGarageOwner && (
            <div style={{ background: "#f4f3ef", borderRadius: 16, padding: "24px 28px" }}>
              <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", marginBottom: 16 }}>Quick Links</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <QuickLink href="/bookings" label="My Bookings" description="View and manage your upcoming appointments" />
                <QuickLink href="/garages" label="Find a Garage" description="Search garages near you" />
              </div>
            </div>
          )}

          <div style={{ background: "#f4f3ef", borderRadius: 16, padding: "24px 28px" }}>
            <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", marginBottom: 6 }}>Account Settings</h3>
            <p style={{ color: "#6b6a66", fontSize: "0.875rem", margin: "0 0 20px" }}>
              Manage your email address, password, and profile photo using the account button in the top navigation bar.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Row label="Email" value={displayEmail} />
              <Row label="Account type" value={isGarageOwner ? "Garage Owner" : "Driver"} />
            </div>
          </div>

        </div>
      </main>
    </>
  )
}

function NotSignedIn() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontSize: "1.8rem", color: "#111110", marginBottom: 12 }}>Sign in to view your profile</h1>
        <Link href="/" className="btn-primary" style={{ fontSize: "0.9rem" }}>Go home</Link>
      </div>
    </div>
  )
}

function CompleteSetup() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontSize: "1.8rem", color: "#111110", marginBottom: 12 }}>Complete your setup</h1>
        <p style={{ color: "#6b6a66", marginBottom: 24 }}>Finish setting up your account to view your profile.</p>
        <Link href="/onboarding" className="btn-primary" style={{ fontSize: "0.9rem" }}>Complete setup</Link>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
      <span style={{ fontSize: "0.8rem", color: "#aaa9a4", fontWeight: 500, minWidth: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "0.9rem", color: "#444441" }}>{value}</span>
    </div>
  )
}

function QuickLink({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link href={href} className="mobile-link" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px", borderRadius: 10, textDecoration: "none",
    }}>
      <div>
        <p style={{ fontWeight: 600, color: "#111110", margin: "0 0 2px", fontSize: "0.95rem" }}>{label}</p>
        <p style={{ color: "#6b6a66", fontSize: "0.8rem", margin: 0 }}>{description}</p>
      </div>
      <span style={{ color: "#aaa9a4", fontSize: "1.1rem", flexShrink: 0 }}>→</span>
    </Link>
  )
}
