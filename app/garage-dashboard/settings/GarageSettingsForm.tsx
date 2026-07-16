"use client"

import { useState, useMemo, useEffect } from "react"
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

type PriceRange = { min: number | null; max: number | null }

type Garage = {
  name: string
  address: string
  city: string
  postcode: string
  description: string | null
  email: string | null
  phone: string | null
  services: string[]
  servicePricing: Record<string, PriceRange> | null
  specialistMakes: string[]
  logoUrl: string | null
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div style={{ background: "#f4f3ef", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}>
        <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111110", margin: 0 }}>{title}</p>
        <p style={{ fontSize: "0.78rem", color: "#6b6a66", margin: "2px 0 0" }}>{subtitle}</p>
      </div>
      <div style={{ padding: "22px" }}>
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
      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
        {commonItems.map((item) => {
          const checked = selected.includes(item)
          return (
            <button key={item} type="button" onClick={() => toggle(item)} style={{
              padding: "5px 13px", borderRadius: 100,
              border: checked ? "none" : "0.5px solid rgba(0,0,0,0.15)",
              background: checked ? "#111110" : "#ffffff",
              color: checked ? "#ffffff" : "#444441",
              fontWeight: 600, fontSize: "0.78rem", cursor: "pointer",
            }}>
              {item}
            </button>
          )
        })}
      </div>

      {customItems.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
          {customItems.map((item) => (
            <span key={item} style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#111110", color: "#ffffff",
              padding: "5px 10px", borderRadius: 100,
              fontSize: "0.78rem", fontWeight: 600,
            }}>
              {item}
              <button type="button" onClick={() => onChange(selected.filter((s) => s !== item))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 0, lineHeight: 1, fontSize: "1rem" }}>
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
          background: customInput.trim() ? "#111110" : "#eceae4",
          color: customInput.trim() ? "#ffffff" : "#6b6a66",
          padding: "9px 16px", borderRadius: 100,
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
  const [email, setEmail] = useState(garage.email ?? "")
  const [phone, setPhone] = useState(garage.phone ?? "")
  const [address, setAddress] = useState(garage.address)
  const [city, setCity] = useState(garage.city)
  const [postcode, setPostcode] = useState(garage.postcode)
  const [description, setDescription] = useState(garage.description ?? "")
  const [services, setServices] = useState<string[]>(garage.services ?? [])
  const [servicePricing, setServicePricing] = useState<Record<string, PriceRange>>(garage.servicePricing ?? {})
  const [specialistMakes, setSpecialistMakes] = useState<string[]>(garage.specialistMakes ?? [])
  const [logoUrl, setLogoUrl] = useState<string | null>(garage.logoUrl)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  // Auto-dismiss the saved toast
  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 3500)
    return () => clearTimeout(t)
  }, [saved])

  // ── Profile completion ────────────────────────────────────────────────────
  const completionItems = useMemo(() => [
    { label: "Logo uploaded",     done: !!logoUrl },
    { label: "Contact details",   done: !!(email.trim() && phone.trim()) },
    { label: "Description added", done: description.trim().length > 0 },
    { label: "Services selected", done: services.length > 0 },
    { label: "Specialist makes",  done: specialistMakes.length > 0 },
    { label: "Address complete",  done: !!(address.trim() && city.trim() && postcode.trim()) },
  ], [logoUrl, email, phone, description, services, specialistMakes, address, city, postcode])

  const completionPct = Math.round(
    (completionItems.filter((i) => i.done).length / completionItems.length) * 100
  )
  const barColor = completionPct === 100 ? "#111110" : completionPct >= 60 ? "#444441" : "#6b6a66"

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setSaved(false); setError("")
    try {
      await updateGarageSettings({ name, email, phone, address, city, postcode, description, services, servicePricing, specialistMakes })
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
      <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "20px 22px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#111110" }}>Profile completeness</p>
          <span style={{ fontWeight: 700, fontSize: "1rem", color: barColor }}>{completionPct}%</span>
        </div>
        <div style={{ background: "#eceae4", borderRadius: 100, height: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 100,
            width: `${completionPct}%`,
            background: "#111110",
            transition: "width 0.4s ease",
          }} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "14px" }}>
          {completionItems.map((item) => (
            <span key={item.label} style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              fontSize: "0.78rem", fontWeight: 600,
              color: item.done ? "#111110" : "#6b6a66",
            }}>
              <span>{item.done ? "✓" : "○"}</span> {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Sections ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Business Identity */}
        <Section title="Business Identity" subtitle="Your garage name, logo and public description">
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
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
                <span style={{ color: "#6b6a66", fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell customers about your garage, your experience, specialisms…"
                style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact Details" subtitle="How customers and Fyca can reach you">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="hello@yourgarage.co.uk" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="01234 567890" style={inputStyle} />
            </div>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location" subtitle="Your garage address shown on your listing">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Street Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required style={inputStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
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
        <Section title="Services" subtitle="Select what you offer — shown on your listing and in the booking form">
          {services.length === 0 && (
            <p style={{ fontSize: "0.8rem", color: "#444441", fontWeight: 600, marginBottom: "12px" }}>
              No services selected — customers won&apos;t be able to book with you.
            </p>
          )}
          <TagCheckboxGroup
            commonItems={COMMON_SERVICES}
            selected={services}
            onChange={setServices}
            customPlaceholder="Add a custom service…"
          />
        </Section>

        {/* Service Pricing */}
        {services.length > 0 && (
          <Section title="Service Pricing" subtitle="Optional price ranges shown to customers when booking">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {services.map(service => {
                const pricing = servicePricing[service] ?? { min: null, max: null }
                return (
                  <div key={service} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111110" }}>{service}</span>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "0.72rem", marginBottom: 3 }}>From (£)</label>
                      <input
                        type="number" min="0" placeholder="—"
                        value={pricing.min ?? ""}
                        onChange={e => setServicePricing(prev => ({ ...prev, [service]: { ...pricing, min: e.target.value ? Number(e.target.value) : null } }))}
                        style={{ ...inputStyle, padding: "7px 10px", fontSize: "0.875rem" }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, fontSize: "0.72rem", marginBottom: 3 }}>Up to (£)</label>
                      <input
                        type="number" min="0" placeholder="—"
                        value={pricing.max ?? ""}
                        onChange={e => setServicePricing(prev => ({ ...prev, [service]: { ...pricing, max: e.target.value ? Number(e.target.value) : null } }))}
                        style={{ ...inputStyle, padding: "7px 10px", fontSize: "0.875rem" }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginTop: "12px" }}>Leave blank if you prefer to quote on inspection.</p>
          </Section>
        )}

        {/* Specialist Makes */}
        <Section title="Specialist Makes" subtitle="Makes you specialise in — helps customers searching by vehicle brand">
          <TagCheckboxGroup
            commonItems={COMMON_MAKES}
            selected={specialistMakes}
            onChange={setSpecialistMakes}
            customPlaceholder="Add another make…"
          />
        </Section>

      </div>

      {/* ── Sticky save bar ────────────────────────────────────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
        background: "#ffffff", borderTop: "0.5px solid rgba(0,0,0,0.10)",
        padding: "14px 32px",
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "16px",
      }}>
        {error && <span style={{ color: "#dc2626", fontWeight: 600, fontSize: "0.875rem" }}>{error}</span>}
        <button
          type="submit"
          disabled={saving}
          style={{
            background: saving ? "#eceae4" : saved ? "#16a34a" : "#111110",
            color: saving ? "#6b6a66" : "#ffffff",
            padding: "12px 32px", borderRadius: 100,
            fontWeight: 600, fontSize: "0.95rem", border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            minWidth: 140,
            transition: "background 0.2s ease",
          }}
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
        </button>
      </div>

      {/* ── Saved toast ────────────────────────────────────────────────────── */}
      {saved && (
        <div
          role="status"
          style={{
            position: "fixed", bottom: 88, left: "50%", zIndex: 30,
            background: "#111110", color: "#ffffff",
            padding: "13px 24px", borderRadius: 100,
            display: "flex", alignItems: "center", gap: 10,
            fontWeight: 600, fontSize: "0.9rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
            animation: "fycaToastIn 0.25s ease",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{
            background: "#16a34a", borderRadius: "50%", width: 20, height: 20,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.7rem", fontWeight: 800, flexShrink: 0,
          }}>✓</span>
          Changes saved — your public listing is up to date
        </div>
      )}
      <style>{`
        @keyframes fycaToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </form>
  )
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "0.5px solid rgba(0,0,0,0.15)",
  borderRadius: 8,
  padding: "10px 14px",
  fontSize: "0.95rem",
  boxSizing: "border-box",
  background: "#ffffff",
  color: "#111110",
}

const labelStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "0.85rem",
  display: "block",
  marginBottom: "6px",
  color: "#444441",
}
