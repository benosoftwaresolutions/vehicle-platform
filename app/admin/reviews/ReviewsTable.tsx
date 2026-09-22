"use client"

import { useState } from "react"
import Link from "next/link"
import DeleteReviewButton from "./DeleteReviewButton"

type Review = {
  id: string
  garageId: string
  clerkId: string
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

export default function ReviewsTable({
  reviews,
  garageMap,
}: {
  reviews: Review[]
  garageMap: Record<string, string>
}) {
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")

  const filtered = reviews.filter(r => {
    if (ratingFilter !== "all" && r.rating !== Number(ratingFilter)) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.comment.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      (garageMap[r.garageId] ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div style={{ marginBottom: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by comment, customer, or garage…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 240, maxWidth: 380, border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "9px 18px", fontSize: "0.875rem", background: "#ffffff", color: "#111110", outline: "none", boxSizing: "border-box" }}
        />
        <select
          value={ratingFilter}
          onChange={e => setRatingFilter(e.target.value)}
          style={{ border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "9px 16px", fontSize: "0.875rem", background: "#ffffff", color: "#111110", outline: "none" }}
        >
          <option value="all">All ratings</option>
          <option value="5">★★★★★ only</option>
          <option value="4">★★★★ only</option>
          <option value="3">★★★ only</option>
          <option value="2">★★ only</option>
          <option value="1">★ only</option>
        </select>
      </div>

      <div className="table-wrap" style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f4f3ef", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
              {["Garage", "Customer", "Rating", "Comment", "Date", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#444441", fontSize: "0.75rem", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((review, i) => (
              <tr key={review.id} style={{ borderBottom: i < filtered.length - 1 ? "0.5px solid rgba(0,0,0,0.06)" : "none" }}>
                <td style={{ padding: "12px 16px" }}>
                  <Link href={`/admin/garages/${review.garageId}`} style={{ fontWeight: 600, color: "#111110", textDecoration: "none" }}>
                    {garageMap[review.garageId] ?? "Unknown garage"}
                  </Link>
                </td>
                <td style={{ padding: "12px 16px", color: "#444441" }}>{review.customerName}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ color: "#111110", fontWeight: 600, whiteSpace: "nowrap" }}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                </td>
                <td style={{ padding: "12px 16px", color: "#444441", maxWidth: 420 }}>
                  <span title={review.comment} style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {review.comment}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: "#6b6a66", whiteSpace: "nowrap" }}>
                  {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <DeleteReviewButton reviewId={review.id} />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#6b6a66" }}>No reviews match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
