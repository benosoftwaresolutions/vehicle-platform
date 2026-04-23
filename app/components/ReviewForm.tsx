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
    setLoading(true); setError("")
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
      <div style={{ background: "#f4f3ef", borderRadius: 10, padding: "14px 16px", color: "#111110", fontWeight: 600, fontSize: "0.9rem" }}>
        Thank you for your review!
      </div>
    )
  }

  const display = hovered || rating

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "#444441", marginBottom: 8 }}>Your rating</p>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "1.75rem", lineHeight: 1, padding: "2px",
                color: star <= display ? "#111110" : "#d1d0cb",
              }}
            >★</button>
          ))}
        </div>
        {rating > 0 && (
          <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginTop: 4 }}>
            {["","Poor","Below average","Average","Good","Excellent"][rating]}
          </p>
        )}
      </div>

      <div>
        <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "#444441", display: "block", marginBottom: 6 }}>
          Your review
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          required
          rows={4}
          placeholder="Tell others about your experience…"
          style={{
            width: "100%",
            border: "0.5px solid rgba(0,0,0,0.15)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: "0.9rem",
            resize: "vertical",
            boxSizing: "border-box",
            color: "#111110",
            background: "#ffffff",
          }}
        />
      </div>

      {error && <p style={{ color: "#dc2626", fontSize: "0.85rem" }}>{error}</p>}

      <button
        type="submit"
        disabled={loading || !rating || !comment.trim()}
        style={{
          background: (!rating || !comment.trim() || loading) ? "#eceae4" : "#111110",
          color: (!rating || !comment.trim() || loading) ? "#6b6a66" : "#ffffff",
          padding: "12px", borderRadius: 100,
          fontWeight: 600, fontSize: "0.9rem", border: "none",
          cursor: (!rating || !comment.trim() || loading) ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  )
}
