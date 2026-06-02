"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Vehicle = {
  id: string
  make: string
  model: string
  year: string
  registration: string
  colour: string | null
  fuelType: string | null
  motExpiry: string | null
  lastServiceDate: string | null
  nextServiceDue: string | null
  currentMileage: number | null
  notes: string | null
}

const FUEL_TYPES = ["petrol", "diesel", "electric", "hybrid", "phev"]

function statusForDate(dateStr: string | null): "overdue" | "soon" | "ok" | null {
  if (!dateStr) return null
  const date = new Date(dateStr)
  const now = new Date()
  const daysUntil = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (daysUntil < 0) return "overdue"
  if (daysUntil <= 30) return "soon"
  return "ok"
}

function StatusPill({ label, date }: { label: string; date: string | null }) {
  if (!date) return null
  const status = statusForDate(date)
  const formatted = new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  const styles: Record<string, { background: string; color: string }> = {
    overdue: { background: "#fee2e2", color: "#991b1b" },
    soon:    { background: "#fffbeb", color: "#92400e" },
    ok:      { background: "#f4f3ef", color: "#444441" },
  }
  const s = styles[status!]
  return (
    <span style={{ ...s, padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
      {status === "overdue" ? `${label} overdue` : `${label} ${formatted}`}
    </span>
  )
}

const emptyForm = {
  make: "", model: "", year: "", registration: "",
  colour: "", fuelType: "",
  motExpiry: "", lastServiceDate: "", nextServiceDue: "",
  currentMileage: "", notes: "",
}

function toFormValues(v: Vehicle) {
  return {
    make: v.make,
    model: v.model,
    year: v.year,
    registration: v.registration,
    colour: v.colour ?? "",
    fuelType: v.fuelType ?? "",
    motExpiry: v.motExpiry ? v.motExpiry.slice(0, 10) : "",
    lastServiceDate: v.lastServiceDate ? v.lastServiceDate.slice(0, 10) : "",
    nextServiceDue: v.nextServiceDue ? v.nextServiceDue.slice(0, 10) : "",
    currentMileage: v.currentMileage !== null ? String(v.currentMileage) : "",
    notes: v.notes ?? "",
  }
}

function VehicleForm({ initial, onSave, onCancel, loading }: {
  initial: typeof emptyForm
  onSave: (data: typeof emptyForm) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof emptyForm, v: string) => setForm(f => ({ ...f, [k]: v }))
  const canSave = form.make && form.model && form.year && form.registration

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card}>
        <p style={cardTitle}>Vehicle details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Make <Req /></label>
            <input value={form.make} onChange={e => set("make", e.target.value)} placeholder="e.g. Ford" style={inp} />
          </div>
          <div>
            <label style={lbl}>Model <Req /></label>
            <input value={form.model} onChange={e => set("model", e.target.value)} placeholder="e.g. Focus" style={inp} />
          </div>
          <div>
            <label style={lbl}>Year <Req /></label>
            <input value={form.year} onChange={e => set("year", e.target.value)} placeholder="e.g. 2019" style={inp} />
          </div>
          <div>
            <label style={lbl}>Registration <Req /></label>
            <input value={form.registration} onChange={e => set("registration", e.target.value.toUpperCase())} placeholder="e.g. AB19 CDE" style={{ ...inp, fontWeight: 700, letterSpacing: "0.05em" }} />
          </div>
          <div>
            <label style={lbl}>Colour</label>
            <input value={form.colour} onChange={e => set("colour", e.target.value)} placeholder="e.g. Blue" style={inp} />
          </div>
          <div>
            <label style={lbl}>Fuel type</label>
            <select value={form.fuelType} onChange={e => set("fuelType", e.target.value)} style={inp}>
              <option value="">Select…</option>
              {FUEL_TYPES.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={card}>
        <p style={cardTitle}>MOT &amp; servicing</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>MOT expiry</label>
            <input type="date" value={form.motExpiry} onChange={e => set("motExpiry", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Current mileage</label>
            <input type="number" value={form.currentMileage} onChange={e => set("currentMileage", e.target.value)} placeholder="e.g. 45000" min={0} style={inp} />
          </div>
          <div>
            <label style={lbl}>Last service date</label>
            <input type="date" value={form.lastServiceDate} onChange={e => set("lastServiceDate", e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Next service due</label>
            <input type="date" value={form.nextServiceDue} onChange={e => set("nextServiceDue", e.target.value)} style={inp} />
          </div>
        </div>
      </div>

      <div style={card}>
        <p style={cardTitle}>Notes</p>
        <textarea
          value={form.notes}
          onChange={e => set("notes", e.target.value)}
          placeholder="Any other details — known issues, modifications, etc."
          rows={3}
          style={{ ...inp, resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => onSave(form)}
          disabled={!canSave || loading}
          style={{ background: canSave && !loading ? "#111110" : "#eceae4", color: canSave && !loading ? "#ffffff" : "#6b6a66", padding: "12px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: canSave && !loading ? "pointer" : "not-allowed" }}
        >
          {loading ? "Saving…" : "Save vehicle"}
        </button>
        <button
          onClick={onCancel}
          style={{ background: "transparent", color: "#6b6a66", padding: "12px 20px", borderRadius: 100, fontWeight: 600, fontSize: "0.9rem", border: "0.5px solid rgba(0,0,0,0.15)", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function VehicleManager({ initialVehicles, vehicleLimit, isPro }: {
  initialVehicles: Vehicle[]
  vehicleLimit: number | null
  isPro: boolean
}) {
  const router = useRouter()
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [mode, setMode] = useState<"list" | "add" | { edit: Vehicle }>("list")
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const refresh = () => router.refresh()

  const buildPayload = (form: typeof emptyForm) => ({
    ...form,
    currentMileage: form.currentMileage ? parseInt(form.currentMileage) : null,
    motExpiry: form.motExpiry || null,
    lastServiceDate: form.lastServiceDate || null,
    nextServiceDue: form.nextServiceDue || null,
  })

  const atLimit = vehicleLimit !== null && vehicles.length >= vehicleLimit

  const handleAdd = async (form: typeof emptyForm) => {
    setLoading(true)
    setSaveError(null)
    const res = await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(form)),
    })
    if (res.ok) {
      const v = await res.json()
      setVehicles(prev => [v, ...prev])
      setMode("list")
      refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      if (data.error === "PLAN_LIMIT") {
        setMode("list")
        setSaveError(null)
      } else {
        setSaveError(data.error || "Something went wrong — please try again")
      }
    }
    setLoading(false)
  }

  const handleEdit = async (form: typeof emptyForm) => {
    if (typeof mode !== "object") return
    setLoading(true)
    setSaveError(null)
    const res = await fetch(`/api/vehicles/${mode.edit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(form)),
    })
    if (res.ok) {
      const updated = await res.json()
      setVehicles(prev => prev.map(v => v.id === updated.id ? updated : v))
      setMode("list")
      refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setSaveError(data.error || "Something went wrong — please try again")
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this vehicle?")) return
    const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" })
    if (res.ok) {
      setVehicles(prev => prev.filter(v => v.id !== id))
      if (expandedId === id) setExpandedId(null)
    }
  }

  if (mode === "add") {
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#111110" }}>Add vehicle</h2>
        </div>
        {saveError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: "0.875rem", fontWeight: 500 }}>
            {saveError}
          </div>
        )}
        <VehicleForm initial={emptyForm} onSave={handleAdd} onCancel={() => { setMode("list"); setSaveError(null) }} loading={loading} />
      </>
    )
  }

  if (typeof mode === "object" && "edit" in mode) {
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#111110" }}>
            {mode.edit.year} {mode.edit.make} {mode.edit.model}
          </h2>
        </div>
        {saveError && (
          <div style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: "0.875rem", fontWeight: 500 }}>
            {saveError}
          </div>
        )}
        <VehicleForm initial={toFormValues(mode.edit)} onSave={handleEdit} onCancel={() => { setMode("list"); setSaveError(null) }} loading={loading} />
      </>
    )
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#111110" }}>
          My vehicles
        </h2>
        {!atLimit && (
          <button
            onClick={() => setMode("add")}
            style={{ background: "#111110", color: "#ffffff", padding: "9px 20px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer" }}
          >
            + Add vehicle
          </button>
        )}
      </div>

      {atLimit && !isPro && <UpgradeDriverBanner />}

      {vehicles.length === 0 ? (
        <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center" }}>
          <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.2rem", color: "#111110", marginBottom: 8 }}>No vehicles yet</h3>
          <p style={{ color: "#6b6a66", marginBottom: 24, fontSize: "0.95rem" }}>Add your vehicles to track MOT dates, service history, and more.</p>
          <button
            onClick={() => setMode("add")}
            style={{ background: "#111110", color: "#ffffff", padding: "11px 24px", borderRadius: 100, fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: "pointer" }}
          >
            Add your first vehicle
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {vehicles.map(v => {
            const isExpanded = expandedId === v.id
            const motStatus = statusForDate(v.motExpiry)
            const serviceStatus = statusForDate(v.nextServiceDue)
            const hasAlert = motStatus === "overdue" || motStatus === "soon" || serviceStatus === "overdue" || serviceStatus === "soon"

            return (
              <div key={v.id} style={{ background: "#f4f3ef", borderRadius: 14, overflow: "hidden", border: hasAlert ? "0.5px solid rgba(234,179,8,0.4)" : "0.5px solid transparent" }}>
                {/* Summary row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                  style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "18px 22px", textAlign: "left", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1rem", color: "#111110" }}>
                        {v.year} {v.make} {v.model}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#444441", letterSpacing: "0.06em" }}>{v.registration}</span>
                      {v.colour && <span style={{ fontSize: "0.8rem", color: "#6b6a66" }}>{v.colour}</span>}
                      {v.fuelType && <span style={{ fontSize: "0.8rem", color: "#6b6a66", textTransform: "capitalize" }}>{v.fuelType}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <StatusPill label="MOT" date={v.motExpiry} />
                      <StatusPill label="Service" date={v.nextServiceDue} />
                      {v.currentMileage !== null && (
                        <span style={{ background: "#eceae4", color: "#444441", padding: "3px 10px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600 }}>
                          {v.currentMileage.toLocaleString()} mi
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ color: "#6b6a66", fontSize: "0.85rem", flexShrink: 0 }}>{isExpanded ? "▲" : "▼"}</span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", padding: "18px 22px", background: "#ffffff" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
                      <InfoRow label="MOT expiry" value={v.motExpiry ? new Date(v.motExpiry).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null} />
                      <InfoRow label="Last service" value={v.lastServiceDate ? new Date(v.lastServiceDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null} />
                      <InfoRow label="Next service due" value={v.nextServiceDue ? new Date(v.nextServiceDue).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null} />
                      <InfoRow label="Mileage" value={v.currentMileage !== null ? `${v.currentMileage.toLocaleString()} miles` : null} />
                    </div>
                    {v.notes && (
                      <p style={{ fontSize: "0.85rem", color: "#444441", background: "#f4f3ef", padding: "10px 14px", borderRadius: 8, marginBottom: 16 }}>
                        {v.notes}
                      </p>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setMode({ edit: v })}
                        style={{ background: "#111110", color: "#ffffff", padding: "8px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.8rem", border: "none", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
                        style={{ background: "transparent", color: "#6b6a66", padding: "8px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.8rem", border: "0.5px solid rgba(0,0,0,0.15)", cursor: "pointer" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#aaa9a4", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontSize: "0.875rem", color: "#111110", margin: 0, fontWeight: 500 }}>{value}</p>
    </div>
  )
}

function UpgradeDriverBanner() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    const res = await fetch("/api/subscriptions/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "driver_pro" }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else setLoading(false)
  }

  return (
    <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "28px 28px", marginBottom: 24, border: "0.5px solid rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.05rem", color: "#111110", margin: "0 0 6px" }}>
            Upgrade to Pro Vehicle Owner
          </p>
          <p style={{ fontSize: "0.875rem", color: "#6b6a66", margin: "0 0 4px", lineHeight: 1.5 }}>
            Free accounts include one vehicle. Pro Vehicle Owner gives you unlimited vehicles, MOT reminders, and service history tracking for just £7/month.
          </p>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          style={{ background: "#111110", color: "#ffffff", padding: "11px 22px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: loading ? "not-allowed" : "pointer", flexShrink: 0, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Loading…" : "Upgrade — £7/month"}
        </button>
      </div>
    </div>
  )
}

function Req() {
  return <span style={{ color: "#6b6a66" }}> *</span>
}

const card: React.CSSProperties = { background: "#f4f3ef", borderRadius: 14, padding: "20px 22px" }
const cardTitle: React.CSSProperties = { fontWeight: 700, fontSize: "0.875rem", color: "#111110", marginBottom: 14 }
const lbl: React.CSSProperties = { fontWeight: 600, fontSize: "0.82rem", color: "#444441", display: "block", marginBottom: 5 }
const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "9px 12px", fontSize: "0.875rem", background: "#ffffff", color: "#111110", boxSizing: "border-box" }
