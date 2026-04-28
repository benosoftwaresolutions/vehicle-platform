import Navbar from "@/app/components/Navbar"
import DryvnFooter from "@/app/components/DryvnFooter"
import Link from "next/link"

export default function GarageNotFound() {
  return (
    <>
      <Navbar />
      <section style={{ padding: "80px 32px", background: "#ffffff", minHeight: "60vh", display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444441", marginBottom: 16 }}>404</p>
          <h1 style={{
            fontFamily: "var(--font-fraunces),'Fraunces',serif",
            fontWeight: 600, fontSize: "clamp(32px,5vw,52px)",
            letterSpacing: "-0.03em", color: "#111110", marginBottom: 16, lineHeight: 1.1,
          }}>
            Garage not found
          </h1>
          <p style={{ fontSize: "1rem", color: "#6b6a66", marginBottom: 36, maxWidth: 400, lineHeight: 1.7 }}>
            This garage may have been removed or the link might be wrong.
          </p>
          <Link href="/garages" style={{
            display: "inline-block",
            background: "#111110", color: "#ffffff",
            padding: "13px 28px", borderRadius: 100,
            fontWeight: 700, fontSize: "0.95rem", textDecoration: "none",
          }}>
            Browse all garages
          </Link>
        </div>
      </section>
      <DryvnFooter />
    </>
  )
}
