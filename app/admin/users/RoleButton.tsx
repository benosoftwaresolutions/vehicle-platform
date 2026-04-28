"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { updateUserRole } from "../actions"

const ROLES = ["pending", "customer", "garage_owner"]

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  customer:     { bg: "#f4f3ef", color: "#444441" },
  garage_owner: { bg: "#111110", color: "#ffffff" },
  pending:      { bg: "#eceae4", color: "#6b6a66" },
}

export default function RoleButton({ userId, currentRole }: { userId: string; currentRole: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      if (
        btnRef.current && !btnRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false)
        setConfirming(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX })
    }
    setConfirming(null)
    setOpen((v) => !v)
  }

  async function handleConfirm() {
    if (!confirming) return
    setLoading(true)
    setOpen(false)
    setConfirming(null)
    await updateUserRole(userId, confirming)
    router.refresh()
    setLoading(false)
  }

  const style = ROLE_STYLE[currentRole] ?? ROLE_STYLE.pending

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{ background: style.bg, color: style.color, border: "none", borderRadius: 100, padding: "3px 10px", fontSize: "0.73rem", fontWeight: 700, cursor: "pointer" }}
      >
        {loading ? "…" : currentRole}
      </button>

      {open && typeof document !== "undefined" && createPortal(
        <div ref={popoverRef} style={{
          position: "absolute", top: pos.top, left: pos.left, zIndex: 9999,
          background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: "8px", minWidth: 200,
        }}>
          {confirming ? (
            <div style={{ padding: "8px" }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#111110", marginBottom: "4px" }}>Confirm role change</p>
              <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginBottom: "14px" }}>
                Change from <strong>{currentRole}</strong> to{" "}
                <span style={{ background: ROLE_STYLE[confirming]?.bg, color: ROLE_STYLE[confirming]?.color, borderRadius: 100, padding: "1px 8px", fontSize: "0.73rem", fontWeight: 700 }}>
                  {confirming}
                </span>?
              </p>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={handleConfirm}
                  style={{ flex: 1, background: "#111110", color: "#ffffff", border: "none", borderRadius: 8, padding: "8px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirming(null)}
                  style={{ flex: 1, background: "transparent", color: "#444441", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "8px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 8px 8px" }}>
                Change role
              </p>
              {ROLES.map((role) => (
                <button
                  key={role}
                  disabled={role === currentRole}
                  onClick={() => setConfirming(role)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    width: "100%", background: role === currentRole ? "#f4f3ef" : "transparent",
                    border: "none", borderRadius: 8, padding: "8px 10px",
                    cursor: role === currentRole ? "default" : "pointer",
                    textAlign: "left",
                  }}
                >
                  <span style={{ background: ROLE_STYLE[role]?.bg ?? "#f4f3ef", color: ROLE_STYLE[role]?.color ?? "#444441", borderRadius: 100, padding: "2px 10px", fontSize: "0.73rem", fontWeight: 700 }}>
                    {role}
                  </span>
                  {role === currentRole && (
                    <span style={{ color: "#6b6a66", fontSize: "0.75rem" }}>current</span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>,
        document.body
      )}
    </>
  )
}
