"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateGarageSettings } from "./actions"

type Garage = {
  name: string
  address: string
  city: string
  postcode: string
  description: string | null
}

export default function GarageSettingsForm({ garage }: { garage: Garage }) {
  const router = useRouter()
  const [name, setName] = useState(garage.name)
  const [address, setAddress] = useState(garage.address)
  const [city, setCity] = useState(garage.city)
  const [postcode, setPostcode] = useState(garage.postcode)
  const [description, setDescription] = useState(garage.description ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError("")

    try {
      await updateGarageSettings({ name, address, city, postcode, description })
      setSaved(true)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "0.95rem",
    boxSizing: "border-box" as const,
  }

  const labelStyle = {
    fontWeight: 600 as const,
    fontSize: "0.875rem",
    display: "block" as const,
    marginBottom: "6px",
    color: "#374151",
  }

  return (
    <div style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Garage Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Street Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Postcode</label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Tell customers about your garage, your experience, specialisms..."
              style={{ ...inputStyle, resize: "vertical" as const }}
            />
          </div>
        </div>

        <div style={{ marginTop: "28px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? "#94a3b8" : "#0f172a",
              color: "white",
              padding: "12px 28px",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
              border: "none",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          {saved && (
            <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.875rem" }}>
              ✓ Changes saved
            </span>
          )}
          {error && (
            <span style={{ color: "#dc2626", fontWeight: 600, fontSize: "0.875rem" }}>
              {error}
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
