import GarageCard from "./components/GarageCard"
import Navbar from "./components/Navbar"
import OnboardingBanner from "./components/OnboardingBanner"
import { prisma } from "./lib/prisma"
import { auth } from "@clerk/nextjs/server"

export default async function Home() {
  const { userId } = await auth()
  const [garages, user] = await Promise.all([
    prisma.garage.findMany(),
    userId ? prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true, profileComplete: true } }) : null,
  ])

  // Show banner when signed in but profile isn't complete.
  // Also covers the webhook-race case: userId present but no DB record yet (user === null).
  const showBanner = !!userId && (!user || !user.profileComplete)
  console.log("[homepage] userId:", userId, "dbUser:", user, "showBanner:", showBanner)

  return (
    <>
      <Navbar role={user?.role} />
      {showBanner && <OnboardingBanner />}
      <section style={{padding: "120px 32px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"}} className="text-white overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <p style={{color: "#f59e0b", fontWeight: 600, fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem"}}>The smarter way to book</p>
          <h1 style={{fontSize: "3.5rem", fontWeight: 800, lineHeight: 1.1, marginBottom: "1.5rem"}}>
            Find and book a garage <br />
            <span style={{color: "#f59e0b"}}>near you</span>
          </h1>
          <p style={{color: "#94a3b8", fontSize: "1.25rem", marginBottom: "2.5rem", maxWidth: "32rem"}}>
            Skip the phone calls. Book your vehicle service online in minutes.
          </p>
          <div style={{display: "flex", gap: "1rem"}}>
            <a href="/garages" style={{background: "#f59e0b", color: "#0f172a", padding: "16px 32px", borderRadius: "12px", fontWeight: 700, fontSize: "1.1rem", textDecoration: "none"}}>
              Find a Garage
            </a>
            <a href="/garages" style={{border: "2px solid #475569", color: "white", padding: "16px 32px", borderRadius: "12px", fontWeight: 700, fontSize: "1.1rem", textDecoration: "none"}}>
              How it works
            </a>
          </div>
        </div>
      </section>
      <main className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Garages</h2>
        <p className="text-gray-500 mb-8">Trusted garages available to book today</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {garages.map((garage) => (
            <GarageCard
              key={garage.id}
              id={garage.id}
              name={garage.name}
              location={`${garage.city}, ${garage.postcode}`}
              rating={garage.rating.toString()}
              services={garage.services.join(", ")}
            />
          ))}
        </div>
      </main>
    </>
  )
}