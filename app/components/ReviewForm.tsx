"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ReviewForm({ garageId }: { garageId: string }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating || !comment.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ garageId, rating, comment }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Something went wrong.")
        return
      }
      setSubmitted(true)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "16px", color: "#166534", fontWeight: 600, fontSize: "0.95rem" }}>
        ✓ Thank you for your review!
      </div>
    )
  }

  const display = hovered || rating

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "10px" }}>Your rating</p>
        <div style={{ display: "flex", gap: "6px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "2rem", lineHeight: 1, padding: "2px",
                color: star <= display ? "#f59e0b" : "#d1d5db",
                transition: "color 0.1s",
              }}
            >
              ★
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
            {["", "Poor", "Below average", "Average", "Good", "Excellent"][rating]}
          </p>
        )}
      </div>

      <div>
        <label style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151", display: "block", marginBottom: "6px" }}>
          Your review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          placeholder="Tell others about your experience..."
          style={{
            width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px",
            padding: "10px 14px", fontSize: "0.9rem", resize: "vertical",
            boxSizing: "border-box",
          }}
        />
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: "0.875rem", fontWeight: 600 }}>{error}</p>}

      <button
        type="submit"
        disabled={loading || !rating || !comment.trim()}
        style={{
          background: loading || !rating || !comment.trim() ? "#94a3b8" : "#0f172a",
          color: "white", padding: "12px", borderRadius: "10px",
          fontWeight: 700, fontSize: "0.95rem", border: "none",
          cursor: loading || !rating || !comment.trim() ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}
