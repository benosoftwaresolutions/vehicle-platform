"use client"

import { useState, useRef, useEffect } from "react"
import { updateProfileName } from "./actions"

export default function ProfileNameEditor({ initialName }: { initialName: string }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(initialName)
  const [saved, setSaved] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const save = async () => {
    if (!name.trim()) { setError("Name can't be empty"); return }
    setSaving(true)
    setError("")
    try {
      await updateProfileName(name.trim())
      setSaved(name.trim())
      setEditing(false)
    } catch {
      setError("Failed to save — please try again")
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => { setName(saved); setEditing(false); setError("") }

  if (!editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.35rem", letterSpacing: "-0.02em", color: "#111110", margin: 0 }}>
          {saved || "Your Name"}
        </h2>
        <button
          onClick={() => setEditing(true)}
          style={{ background: "none", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "3px 12px", fontSize: "0.75rem", fontWeight: 600, color: "#6b6a66", cursor: "pointer" }}
        >
          Edit name
        </button>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel() }}
          style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.25rem", letterSpacing: "-0.02em", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", borderRadius: 8, padding: "4px 10px", outline: "none", background: "#ffffff", minWidth: 0, width: 220 }}
        />
        <button
          onClick={save}
          disabled={saving}
          style={{ background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "5px 16px", fontSize: "0.8rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1 }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          onClick={cancel}
          style={{ background: "transparent", color: "#444441", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "5px 14px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
      {error && <p style={{ fontSize: "0.78rem", color: "#dc2626", marginTop: 4 }}>{error}</p>}
    </div>
  )
}
