"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function ProfileError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[profile error]", error.message, error.digest)
  }, [error])

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontSize: "2rem", color: "#111110", marginBottom: 12 }}>
          Profile unavailable
        </h1>
        <p style={{ color: "#6b6a66", marginBottom: 8 }}>
          {error.message || "An unexpected error occurred loading your profile."}
        </p>
        {error.digest && (
          <p style={{ color: "#aaa9a4", fontSize: "0.8rem", marginBottom: 24, fontFamily: "monospace" }}>
            Error ID: {error.digest}
          </p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={reset} className="btn-primary" style={{ fontSize: "0.9rem" }}>Try again</button>
          <Link href="/" className="btn-ghost" style={{ fontSize: "0.9rem" }}>Home</Link>
        </div>
      </div>
    </div>
  )
}
