"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { updateGarageSettings } from "./actions"
import LogoUploader from "@/app/components/LogoUploader"

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
  logoUrl: string | null
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", background: "#f8f9fb", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "1.25rem" }}>{icon}</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a", margin: 0 }}>{title}</p>
          <p style={{ fontSize: "0.8rem", color: "#64748b", margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      <div style={{ padding: "24px", background: "white" }}>
        {children}
      </div>
    </div>
  )
}

// ─── Tag checkbox group ───────────────────────────────────────────────────────

function TagCheckboxGroup({
  commonItems,
  selected,
  onChange,
  customPlaceholder,
}: {
  commonItems: string[]
  selected: string[]
  onChange: (updated: string[]) => void
  customPlaceholder: string
}) {
  const [customInput, setCustomInput] = useState("")

  const toggle = (item: string) =>
    onChange(selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item])

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !selected.includes(trimmed)) onChange([...selected, trimmed])
    setCustomInput("")
  }

  const customItems = selected.filter((s) => !commonItems.includes(s))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {commonItems.map((item) => {
          const checked = selected.includes(item)
          return (
            <button key={item} type="button" onClick={() => toggle(item)} style={{
              padding: "6px 13px", borderRadius: "8px",
              border: checked ? "2px solid #0f172a" : "1px solid #e5e7eb",
              background: checked ? "#0f172a" : "white",
              color: checked ? "white" : "#374151",
              fontWeight: 600, fontSize: "0.8rem", cursor: "pointer",
              transition: "all 0.1s",
            }}>
              {checked ? "✓ " : ""}{item}
            </button>
          )
        })}
      </div>

      {customItems.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {customItems.map((item) => (
            <span key={item} style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#f0fdf4", border: "1px solid #86efac",
              color: "#166534", padding: "5px 10px", borderRadius: "8px",
              fontSize: "0.8rem", fontWeight: 600,
            }}>
              {item}
              <button type="button" onClick={() => onChange(selected.filter((s) => s !== item))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#166534", padding: 0, lineHeight: 1, fontSize: "1rem" }}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text" value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom() } }}
          placeholder={customPlaceholder}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="button" onClick={addCustom} disabled={!customInput.trim()} style={{
          background: customInput.trim() ? "#0f172a" : "#e5e7eb",
          color: customInput.trim() ? "white" : "#9ca3af",
          padding: "10px 16px", borderRadius: "8px",
          fontWeight: 600, fontSize: "0.875rem", border: "none",
          cursor: customInput.trim() ? "pointer" : "not-allowed", whiteSpace: "nowrap",
        }}>
          + Add
        </button>
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export default function GarageSettingsForm({ garage }: { garage: Garage }) {
  const router = useRouter()
  const [name, setName] = useState(garage.name)
  const [address, setAddress] = useState(garage.address)
  const [city, setCity] = useState(garage.city)
  const [postcode, setPostcode] = useState(garage.postcode)
  const [description, setDescription] = useState(garage.description ?? "")
  const [services, setServices] = useState<string[]>(garage.services)
  const [specialistMakes, setSpecialistMakes] = useState<string[]>(garage.specialistMakes)
  const [logoUrl, setLogoUrl] = useState<string | null>(garage.logoUrl)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  // ── Profile completion ────────────────────────────────────────────────────
  const completionItems = useMemo(() => [
    { label: "Logo uploaded",       done: !!logoUrl },
    { label: "Description added",   done: description.trim().length > 0 },
    { label: "Services selected",   done: services.length > 0 },
    { label: "Specialist makes",    done: specialistMakes.length > 0 },
    { label: "Address complete",    done: !!(address.trim() && city.trim() && postcode.trim()) },
  ], [logoUrl, description, services, specialistMakes, address, city, postcode])

  const completionPct = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  )
  const barColor = completionPct === 100 ? "#16a34a" : completionPct >= 60 ? "#f59e0b" : "#ef4444"

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setSaved(false); setError("")
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
    <form onSubmit={handleSubmit} style={{ paddingBottom: 88 }}>

      {/* ── Profile completion bar ─────────────────────────────────────────── */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0f172a" }}>Profile completeness</p>
          <span style={{ fontWeight: 800, fontSize: "1.1rem", color: barColor }}>{completionPct}%</span>
        </div>
        <div style={{ background: "#f1f5f9", borderRadius: "999px", height: 8, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: "999px",
            width: `${completionPct}%`,
            background: barColor,
            transition: "width 0.4s ease, background 0.3s ease",
          }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "14px" }}>
          {completionItems.map((item) => (
            <span key={item.label} style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              fontSize: "0.78rem", fontWeight: 600,
              color: item.done ? "#16a34a" : "#94a3b8",
            }}>
              <span>{item.done ? "✓" : "○"}</span> {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Sections ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Business Identity */}
        <Section icon="🏢" title="Business Identity" subtitle="Your garage name, logo and public description">
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={labelStyle}>Garage Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Logo</label>
              <LogoUploader currentLogoUrl={logoUrl} onLogoChange={setLogoUrl} />
            </div>
            <div>
              <label style={labelStyle}>
                Description{" "}
                <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell customers about your garage, your experience, specialisms..."
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>
        </Section>

        {/* Location */}
        <Section icon="📍" title="Location" subtitle="Your garage address shown on your listing">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
          </div>
        </Section>

        {/* Services */}
        <Section icon="⚙️" title="Services" subtitle="Select what you offer — shown on your listing and in the booking form">
          {services.length === 0 && (
            <p style={{ fontSize: "0.8rem", color: "#f59e0b", fontWeight: 600, marginBottom: "12px" }}>
              ⚠ No services selected — customers won&apos;t be able to book with you.
            </p>
          )}
          <TagCheckboxGroup
            commonItems={COMMON_SERVICES}
            selected={services}
            onChange={setServices}
            customPlaceholder="Add a custom service..."
          />
        </Section>

        {/* Specialist Makes */}
        <Section icon="🚗" title="Specialist Makes" subtitle="Makes you specialise in — helps customers searching by vehicle brand">
          <TagCheckboxGroup
            commonItems={COMMON_MAKES}
            selected={specialistMakes}
            onChange={setSpecialistMakes}
            customPlaceholder="Add another make..."
          />
        </Section>

      </div>

      {/* ── Sticky save bar ────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
        background: "white", borderTop: "1px solid #e5e7eb",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "16px",
        boxShadow: "0 -4px 16px rgba(0,0,0,0.06)",
      }}>
        {saved && <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.875rem" }}>✓ Changes saved</span>}
        {error && <span style={{ color: "#dc2626", fontWeight: 600, fontSize: "0.875rem" }}>{error}</span>}
        <button
          type="submit"
          disabled={saving}
          style={{
            background: saving ? "#94a3b8" : "#0f172a",
            color: "white", padding: "12px 32px", borderRadius: "10px",
            fontWeight: 700, fontSize: "0.95rem", border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            minWidth: 140,
          }}
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
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
