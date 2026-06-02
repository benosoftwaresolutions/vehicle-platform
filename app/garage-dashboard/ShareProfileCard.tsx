"use client"

import { useState } from "react"

export default function ShareProfileCard({ garageId }: { garageId: string }) {
  const url = `https://fyca.co.uk/garages/${garageId}`
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea")
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "20px 22px", marginBottom: "28px" }}>
      <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "6px" }}>
        Your Public Profile
      </h2>
      <p style={{ fontSize: "0.85rem", color: "#6b6a66", marginBottom: "14px" }}>
        Share this link on your website or social media so customers can find and book you directly.
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0, background: "#ffffff", borderRadius: 8, padding: "9px 14px", border: "0.5px solid rgba(0,0,0,0.12)", fontSize: "0.85rem", color: "#444441", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {url}
        </div>
        <button
          onClick={copy}
          style={{
            background: copied ? "#111110" : "#ffffff",
            color: copied ? "#ffffff" : "#111110",
            border: "0.5px solid rgba(0,0,0,0.2)",
            borderRadius: 100, padding: "9px 18px",
            fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
            whiteSpace: "nowrap", flexShrink: 0,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          href={`/garages/${garageId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: "transparent", color: "#444441",
            border: "0.5px solid rgba(0,0,0,0.15)",
            borderRadius: 100, padding: "9px 18px",
            fontSize: "0.85rem", fontWeight: 600,
            textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          Preview
        </a>
      </div>
    </div>
  )
}
