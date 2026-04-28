export default function Loading() {
  return (
    <>
      {/* Header skeleton */}
      <div style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "48px 32px 36px", background: "#ffffff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ width: 120, height: 12, borderRadius: 6, background: "#f4f3ef", marginBottom: 20 }} />
          <div style={{ width: 260, height: 36, borderRadius: 8, background: "#f4f3ef", marginBottom: 12 }} />
          <div style={{ width: 180, height: 14, borderRadius: 6, background: "#f4f3ef", marginBottom: 12 }} />
          <div style={{ width: 100, height: 14, borderRadius: 6, background: "#f4f3ef" }} />
        </div>
      </div>

      {/* Content skeleton */}
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[100, 80, 120].map((w, i) => (
              <div key={i} style={{ background: "#f4f3ef", borderRadius: 14, padding: 24 }}>
                <div style={{ width: w, height: 14, borderRadius: 6, background: "#eceae4", marginBottom: 16 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  {[60, 80, 70].map((bw, j) => (
                    <div key={j} style={{ width: bw, height: 28, borderRadius: 100, background: "#eceae4" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ background: "#f4f3ef", borderRadius: 14, padding: 24, height: 320 }} />
        </div>
      </main>
    </>
  )
}
