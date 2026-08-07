import Link from "next/link"

export default function FycaFooter() {
  return (
    <footer className="footer-root" style={{
      borderTop: "0.5px solid rgba(0,0,0,0.10)",
      padding: "48px 28px 32px",
      background: "#ffffff",
    }}>
      <div className="footer-body" style={{
        maxWidth: 900, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        flexWrap: "wrap", gap: 32, marginBottom: 40,
      }}>

        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 11, background: "#111110",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ color: "#ffffff", fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 700, fontSize: 15, lineHeight: 1, letterSpacing: "-0.04em" }}>F</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span style={{
                fontFamily: "var(--font-fraunces),'Fraunces',serif",
                fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.04em", color: "#111110", lineHeight: 1,
              }}>Fyca</span>
              <span style={{ fontSize: 7, fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase", color: "#aaa9a4", lineHeight: 1 }}>
                Fix Your Car Anywhere
              </span>
            </div>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#6b6a66", margin: 0 }}>
            fyca.co.uk
          </p>
        </div>

        {/* Links */}
        <div className="footer-links" style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa9a4", margin: 0 }}>Platform</p>
            {[
              { label: "Find a garage", href: "/garages" },
              { label: "For drivers", href: "/for-drivers" },
              { label: "For garages", href: "/for-garages" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="footer-link" style={{
                color: "#6b6a66", fontSize: "0.875rem", fontWeight: 500,
                textDecoration: "none",
              }}>
                {label}
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#aaa9a4", margin: 0 }}>Company</p>
            {[
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Privacy", href: "/privacy" },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="footer-link" style={{
                color: "#6b6a66", fontSize: "0.875rem", fontWeight: 500,
                textDecoration: "none",
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="footer-copyright" style={{ maxWidth: 900, margin: "0 auto", borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: 20 }}>
        <p style={{ fontSize: "0.78rem", color: "#aaa9a4", margin: 0 }}>
          © 2026 Fyca. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
