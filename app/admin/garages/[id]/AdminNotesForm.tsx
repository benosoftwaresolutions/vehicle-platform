"use client"

import { useState } from "react"
import { saveAdminNotes } from "@/app/admin/actions"

export default function AdminNotesForm({ garageId, initialNotes }: { garageId: string; initialNotes: string | null }) {
  const [notes, setNotes] = useState(initialNotes ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await saveAdminNotes(garageId, notes)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: 14, padding: "24px" }}>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Admin Notes</p>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Internal notes — visit dates, conversations, follow-ups…"
        rows={4}
        style={{ width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: "0.875rem", color: "#111110", background: "#f9f8f5", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ background: saving ? "#eceae4" : "#111110", color: saving ? "#6b6a66" : "#ffffff", padding: "8px 20px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: saving ? "not-allowed" : "pointer" }}
        >
          {saving ? "Saving…" : "Save notes"}
        </button>
        {saved && <span style={{ fontSize: "0.82rem", color: "#6b6a66", fontWeight: 600 }}>Saved</span>}
      </div>
    </div>
  )
}
