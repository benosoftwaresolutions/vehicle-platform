"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

export default function Pagination({ total, perPage }: { total: number; perPage: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page") ?? 1)
  const totalPages = Math.ceil(total / perPage)

  if (totalPages <= 1) return null

  function pageUrl(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(p))
    return `${pathname}?${params}`
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" }}>
      <p style={{ color: "#6b6a66", fontSize: "0.82rem" }}>
        Page {currentPage} of {totalPages} — {total} total
      </p>
      <div style={{ display: "flex", gap: "6px" }}>
        {currentPage > 1 && (
          <Link href={pageUrl(currentPage - 1)} style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "6px 14px", fontSize: "0.82rem", fontWeight: 600, color: "#111110", textDecoration: "none" }}>
            Previous
          </Link>
        )}
        {currentPage < totalPages && (
          <Link href={pageUrl(currentPage + 1)} style={{ background: "#111110", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: "0.82rem", fontWeight: 600, color: "#ffffff", textDecoration: "none" }}>
            Next
          </Link>
        )}
      </div>
    </div>
  )
}
