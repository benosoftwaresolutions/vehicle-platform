export default function EnvironmentBanner() {
  const envLabel = process.env.NEXT_PUBLIC_ENV

  if (envLabel === "production" || !envLabel) return null

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: "#111110",
      color: "#ffffff",
      fontSize: 12,
      fontWeight: 500,
      textAlign: "center",
      padding: "5px 16px",
      letterSpacing: "0.02em",
      pointerEvents: "none",
    }}>
      ⚠ {envLabel === "preview" ? "Preview" : "Dev"} environment — this is not the live site
    </div>
  )
}
