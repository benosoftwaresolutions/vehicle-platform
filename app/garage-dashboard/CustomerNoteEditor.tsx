"use client"

import { useState, useEffect, useRef } from "react"

export default function CustomerNoteEditor({ garageId, registration, initialNote }: {
  garageId: string
  registration: string
  initialNote: string | null
}) {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(initialNote ?? "")
  const [saved, setSaved] = useState(initialNote ?? "")
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) textareaRef.current?.focus()
  }, [open])

  const deleteNote = () => save("")

  const save = async (overrideNote?: string) => {
    const noteToSave = overrideNote !== undefined ? overrideNote : note
    setSaving(true)
    try {
      const res = await fetch(`/api/garages/${garageId}/customer-notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration, note: noteToSave }),
      })
      const data = await res.json()
      setSaved(data.note ?? "")
      setNote(data.note ?? "")
      setOpen(false)
    } catch {
    } finally {
      setSaving(false)
    }
  }

  const cancel = () => {
    setNote(saved)
    setOpen(false)
  }

  return (
    <div style={{ marginTop: "8px" }}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, color: "#6b6a66", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
        >
          <span>{saved ? "▾" : "▸"}</span>
          <span>{saved ? "Customer note" : "Add customer note"}</span>
        </button>
      ) : null}

      {!open && saved && (
        <div
          onClick={() => setOpen(true)}
          style={{ marginTop: 6, background: "#eceae4", borderRadius: 8, padding: "8px 12px", fontSize: "0.82rem", color: "#444441", cursor: "pointer", whiteSpace: "pre-wrap", lineHeight: 1.5 }}
        >
          {saved}
        </div>
      )}

      {open && (
        <div style={{ marginTop: 6 }}>
          <textarea
            ref={textareaRef}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Private note about this customer or vehicle…"
            rows={3}
            style={{ width: "100%", border: "0.5px solid rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: "0.85rem", background: "#ffffff", color: "#111110", resize: "vertical", fontFamily: "var(--font-dm-sans), sans-serif", lineHeight: 1.5 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              type="button"
              onClick={() => save()}
              disabled={saving}
              style={{ background: "#111110", color: "#ffffff", border: "none", borderRadius: 100, padding: "6px 16px", fontSize: "0.8rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1 }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancel}
              style={{ background: "transparent", color: "#444441", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 100, padding: "6px 14px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            {saved && (
              <button
                type="button"
                onClick={deleteNote}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.78rem", color: "#9b9a96", padding: "6px 0", marginLeft: "auto" }}
              >
                Delete note
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
