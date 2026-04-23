import Link from "next/link"

export default function DryvnFooter() {
  return (
    <footer style={{
      borderTop: "0.5px solid rgba(0,0,0,0.10)",
      padding: "40px 28px",
      background: "#ffffff",
    }}>
      <div style={{
        maxWidth: 900, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 24,
      }}>

        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: "#111110",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 12V2M7 2L2 7M7 2L12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{
              fontFamily: "var(--font-fraunces),'Fraunces',serif",
              fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.03em", color: "#111110",
            }}>dryvn</span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#6b6a66", margin: 0 }}>
            Book smarter. Drive sooner.
          </p>
        </div>

        {/* Links */}
        <div style={{ display: "flex", gap: 28 }}>
          {[
            { label: "About",   href: "#" },
            { label: "Contact", href: "#" },
            { label: "Privacy", href: "#" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} style={{
              color: "#6b6a66", fontSize: "0.875rem", fontWeight: 500,
              textDecoration: "none",
            }}>
              {label}
            </Link>
          ))}
        </div>

      </div>
    </footer>
  )
}
