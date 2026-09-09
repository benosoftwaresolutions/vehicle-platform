// Shared in-place confirmation pill shown after a booking action succeeds.
export default function ActionDone({ label, sub }: { label: string; sub?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
      <span style={{ background: "#16a34a", color: "#ffffff", padding: "6px 14px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
        ✓ {label}
      </span>
      {sub && <span style={{ fontSize: "0.75rem", color: "#6b6a66" }}>{sub}</span>}
    </div>
  )
}
