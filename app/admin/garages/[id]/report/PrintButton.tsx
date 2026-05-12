"use client"

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "9px 20px", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}
    >
      Print / Save PDF
    </button>
  )
}
