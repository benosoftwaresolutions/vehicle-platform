"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", background: "#ffffff" }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#111110", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 12V2M7 2L2 7M7 2L12 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", letterSpacing: "-0.03em" }}>dryvn</span>
          </Link>
        </div>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(32px,5vw,48px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: 12 }}>
          Something went wrong
        </h1>
        <p style={{ color: "#6b6a66", marginBottom: 32, lineHeight: 1.6 }}>
          An unexpected error occurred. Try again, or go back to the homepage.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{ background: "#111110", color: "#ffffff", padding: "13px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", border: "none", cursor: "pointer" }}
          >
            Try again
          </button>
          <Link href="/" style={{ background: "#f4f3ef", color: "#111110", padding: "13px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.95rem", textDecoration: "none" }}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
