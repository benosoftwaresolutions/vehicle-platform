"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateGarageSettings } from "./actions"

const COMMON_SERVICES = [
  "MOT", "Full Service", "Interim Service", "Oil Change", "Tyres", "Wheel Alignment", "Wheel Balancing",
  "Brakes", "Brake Fluid Change", "Clutch Replacement", "Gearbox Repair", "Suspension", "Steering",
  "Exhaust", "Catalytic Converter", "Engine Diagnostics", "Air Con Service", "Air Con Regas", "Cambelt",
  "Timing Chain", "Battery Replacement", "Alternator", "Starter Motor", "Radiator", "Coolant Flush",
  "Transmission Service", "4WD Service", "Pre-purchase Inspection", "ADAS Calibration", "DPF Cleaning",
  "EGR Cleaning", "Welding", "Bodywork", "Windscreen Repair", "Windscreen Replacement", "Tow Bar Fitting",
  "Alloy Wheel Repair",
]
const COMMON_MAKES = [
  "Abarth", "Alfa Romeo", "Audi", "BMW", "Bentley", "Bugatti", "Cadillac", "Chevrolet", "Chrysler",
  "Citroen", "Cupra", "DS", "Dacia", "Dodge", "Ferrari", "Fiat", "Ford", "Genesis", "Honda", "Hyundai",
  "Infiniti", "Jaguar", "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus", "Lotus", "MG", "MINI",
  "Maserati", "Mazda", "McLaren", "Mercedes", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "Renault",
  "Rolls-Royce", "SEAT", "SKODA", "Ssangyong", "Subaru", "Suzuki", "Tesla", "Toyota", "Vauxhall",
  "Volkswagen", "Volvo",
]

type Garage = {
  name: string
  address: string
  city: string
  postcode: string
  description: string | null
  services: string[]
  specialistMakes: string[]
}

function TagCheckboxGroup({
  label,
  commonItems,
  selected,
  onChange,
  customPlaceholder,
}: {
  label: string
  commonItems: string[]
  selected: string[]
  onChange: (updated: string[]) => void
  customPlaceholder: string
}) {
  const [customInput, setCustomInput] = useState("")

  const toggle = (item: string) => {
    onChange(selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item])
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed])
    }
    setCustomInput("")
  }

  const removeCustom = (item: string) => onChange(selected.filter((s) => s !== item))

  const customItems = selected.filter((s) => !commonItems.includes(s))

  return (
    <div>
      <label style={labelStyle}>{label}</label>

      {/* Common checkboxes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        {commonItems.map((item) => {
          const checked = selected.includes(item)
          return (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: checked ? "2px solid #0f172a" : "1px solid #e5e7eb",
                background: checked ? "#0f172a" : "white",
                color: checked ? "white" : "#374151",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {checked ? "✓ " : ""}{item}
            </button>
          )
        })}
      </div>

      {/* Custom additions */}
      {customItems.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {customItems.map((item) => (
            <span
              key={item}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#f0fdf4", border: "1px solid #86efac",
                color: "#166534", padding: "5px 10px", borderRadius: "8px",
                fontSize: "0.8rem", fontWeight: 600,
              }}
            >
              {item}
              <button
                type="button"
                onClick={() => removeCustom(item)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", padding: 0, lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add custom */}
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom() } }}
          placeholder={customPlaceholder}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim()}
          style={{
            background: customInput.trim() ? "#0f172a" : "#e5e7eb",
            color: customInput.trim() ? "white" : "#9ca3af",
            padding: "10px 16px", borderRadius: "8px",
            fontWeight: 600, fontSize: "0.875rem",
            border: "none", cursor: customInput.trim() ? "pointer" : "not-allowed",
            whiteSpace: "nowrap",
          }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

export default function GarageSettingsForm({ garage }: { garage: Garage }) {
  const router = useRouter()
  const [name, setName] = useState(garage.name)
  const [address, setAddress] = useState(garage.address)
  const [city, setCity] = useState(garage.city)
  const [postcode, setPostcode] = useState(garage.postcode)
  const [description, setDescription] = useState(garage.description ?? "")
  const [services, setServices] = useState<string[]>(garage.services)
  const [specialistMakes, setSpecialistMakes] = useState<string[]>(garage.specialistMakes)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError("")
    try {
      await updateGarageSettings({ name, address, city, postcode, description, services, specialistMakes })
      setSaved(true)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Basic info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={sectionHeadingStyle}>Garage Details</p>
            <div>
              <label style={labelStyle}>Garage Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Street Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Postcode</label>
                <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value.toUpperCase())} required style={inputStyle} />
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

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9" }} />

          {/* Services */}
          <div>
            <p style={sectionHeadingStyle}>Services</p>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "16px" }}>
              Select the services your garage offers. These appear on your listing and in the customer booking form.
            </p>
            <TagCheckboxGroup
              label="Services offered"
              commonItems={COMMON_SERVICES}
              selected={services}
              onChange={setServices}
              customPlaceholder="e.g. Gearbox Repair"
            />
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f1f5f9" }} />

          {/* Specialist makes */}
          <div>
            <p style={sectionHeadingStyle}>Specialist Vehicle Makes</p>
            <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "16px" }}>
              Select the makes your garage specialises in. This is displayed on your listing to help customers find you.
            </p>
            <TagCheckboxGroup
              label="Specialist makes"
              commonItems={COMMON_MAKES}
              selected={specialistMakes}
              onChange={setSpecialistMakes}
              customPlaceholder="e.g. Skoda"
            />
          </div>

        </div>

        <div style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: saving ? "#94a3b8" : "#0f172a",
              color: "white", padding: "12px 28px", borderRadius: "10px",
              fontWeight: 700, fontSize: "0.95rem", border: "none",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          {saved && <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.875rem" }}>✓ Changes saved</span>}
          {error && <span style={{ color: "#dc2626", fontWeight: 600, fontSize: "0.875rem" }}>{error}</span>}
        </div>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "10px 14px",
  fontSize: "0.95rem",
  boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "0.875rem",
  display: "block",
  marginBottom: "6px",
  color: "#374151",
}

const sectionHeadingStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "1rem",
  color: "#0f172a",
  marginBottom: "4px",
}
