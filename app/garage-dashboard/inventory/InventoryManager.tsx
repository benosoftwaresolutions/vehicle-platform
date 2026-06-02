"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Part = {
  id: string
  name: string
  category: string | null
  quantity: number
  reorderLevel: number
  unit: string
  supplier: string | null
  supplierEmail: string | null
  costPrice: number | null
}

const emptyForm = {
  name: "", category: "", quantity: "", reorderLevel: "", unit: "units",
  supplier: "", supplierEmail: "", costPrice: "",
}

const CATEGORIES = ["Oil & Fluids", "Filters", "Brakes", "Tyres", "Electrical", "Exhaust", "Suspension", "General"]
const UNITS = ["units", "litres", "kg", "metres", "pairs", "sets"]

function stockStatus(part: Part): "low" | "out" | "ok" {
  if (part.quantity <= 0) return "out"
  if (part.quantity <= part.reorderLevel) return "low"
  return "ok"
}

function StatusBadge({ part }: { part: Part }) {
  const s = stockStatus(part)
  const styles = {
    out: { background: "#fee2e2", color: "#991b1b" },
    low: { background: "#fffbeb", color: "#92400e" },
    ok:  { background: "#f0fdf4", color: "#166534" },
  }
  const labels = { out: "Out of stock", low: "Low stock", ok: "In stock" }
  return (
    <span style={{ ...styles[s], padding: "3px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap" }}>
      {labels[s]}
    </span>
  )
}

function PartForm({ initial, onSave, onCancel, loading }: {
  initial: typeof emptyForm
  onSave: (data: typeof emptyForm) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof typeof emptyForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={card}>
        <p style={cardTitle}>Part details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>Name *</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. 5W-30 Engine Oil" style={inp} />
          </div>
          <div>
            <label style={lbl}>Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} style={inp}>
              <option value="">Select…</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Unit</label>
            <select value={form.unit} onChange={e => set("unit", e.target.value)} style={inp}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Quantity in stock</label>
            <input type="number" min={0} value={form.quantity} onChange={e => set("quantity", e.target.value)} placeholder="0" style={inp} />
          </div>
          <div>
            <label style={lbl}>Reorder at</label>
            <input type="number" min={0} value={form.reorderLevel} onChange={e => set("reorderLevel", e.target.value)} placeholder="e.g. 2" style={inp} />
          </div>
          <div>
            <label style={lbl}>Cost price (£)</label>
            <input type="number" min={0} step={0.01} value={form.costPrice} onChange={e => set("costPrice", e.target.value)} placeholder="e.g. 12.50" style={inp} />
          </div>
        </div>
      </div>

      <div style={card}>
        <p style={cardTitle}>Supplier</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={lbl}>Supplier name</label>
            <input value={form.supplier} onChange={e => set("supplier", e.target.value)} placeholder="e.g. GSF Car Parts" style={inp} />
          </div>
          <div>
            <label style={lbl}>Supplier email</label>
            <input type="email" value={form.supplierEmail} onChange={e => set("supplierEmail", e.target.value)} placeholder="orders@supplier.com" style={inp} />
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => onSave(form)}
          disabled={!form.name.trim() || loading}
          style={{ background: form.name.trim() && !loading ? "#111110" : "#eceae4", color: form.name.trim() && !loading ? "#ffffff" : "#6b6a66", padding: "12px 28px", borderRadius: 100, fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: form.name.trim() && !loading ? "pointer" : "not-allowed" }}
        >
          {loading ? "Saving…" : "Save part"}
        </button>
        <button onClick={onCancel} style={{ background: "transparent", color: "#6b6a66", padding: "12px 20px", borderRadius: 100, fontWeight: 600, fontSize: "0.9rem", border: "0.5px solid rgba(0,0,0,0.15)", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function InventoryManager({ initialParts }: { initialParts: Part[] }) {
  const router = useRouter()
  const [parts, setParts] = useState(initialParts)
  const [mode, setMode] = useState<"list" | "add" | { edit: Part }>("list")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => router.refresh()

  const handleAdd = async (form: typeof emptyForm) => {
    setLoading(true); setError(null)
    const res = await fetch("/api/inventory", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const p = await res.json()
      setParts(prev => [...prev, p].sort((a, b) => a.name.localeCompare(b.name)))
      setMode("list"); refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Something went wrong")
    }
    setLoading(false)
  }

  const handleEdit = async (form: typeof emptyForm) => {
    if (typeof mode !== "object") return
    setLoading(true); setError(null)
    const res = await fetch(`/api/inventory/${mode.edit.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json()
      setParts(prev => prev.map(p => p.id === updated.id ? updated : p).sort((a, b) => a.name.localeCompare(b.name)))
      setMode("list"); refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || "Something went wrong")
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this part?")) return
    const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" })
    if (res.ok) setParts(prev => prev.filter(p => p.id !== id))
  }

  const lowStockCount = parts.filter(p => stockStatus(p) !== "ok").length

  if (mode === "add") {
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <h2 style={heading}>Add part</h2>
        </div>
        {error && <div style={errorBox}>{error}</div>}
        <PartForm initial={emptyForm} onSave={handleAdd} onCancel={() => { setMode("list"); setError(null) }} loading={loading} />
      </>
    )
  }

  if (typeof mode === "object" && "edit" in mode) {
    const p = mode.edit
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <h2 style={heading}>{p.name}</h2>
        </div>
        {error && <div style={errorBox}>{error}</div>}
        <PartForm
          initial={{ name: p.name, category: p.category ?? "", quantity: String(p.quantity), reorderLevel: String(p.reorderLevel), unit: p.unit, supplier: p.supplier ?? "", supplierEmail: p.supplierEmail ?? "", costPrice: p.costPrice !== null ? String(p.costPrice) : "" }}
          onSave={handleEdit}
          onCancel={() => { setMode("list"); setError(null) }}
          loading={loading}
        />
      </>
    )
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={heading}>Parts Inventory</h2>
          {lowStockCount > 0 && (
            <p style={{ fontSize: "0.82rem", color: "#92400e", marginTop: 4 }}>
              {lowStockCount} part{lowStockCount !== 1 ? "s" : ""} need attention
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/garage-dashboard/insights" style={{ background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none" }}>
            AI Insights
          </Link>
          <button onClick={() => setMode("add")} style={{ background: "#111110", color: "#ffffff", padding: "9px 20px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", border: "none", cursor: "pointer" }}>
            + Add part
          </button>
        </div>
      </div>

      {parts.length === 0 ? (
        <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center" }}>
          <h3 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.2rem", color: "#111110", marginBottom: 8 }}>No parts yet</h3>
          <p style={{ color: "#6b6a66", marginBottom: 24, fontSize: "0.95rem" }}>Add the parts you stock so the AI can predict what you need to order.</p>
          <button onClick={() => setMode("add")} style={{ background: "#111110", color: "#ffffff", padding: "11px 24px", borderRadius: 100, fontWeight: 600, fontSize: "0.9rem", border: "none", cursor: "pointer" }}>
            Add your first part
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {parts.map(p => (
            <div key={p.id} style={{ background: "#f4f3ef", borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 16, border: stockStatus(p) !== "ok" ? "0.5px solid rgba(234,179,8,0.4)" : "0.5px solid transparent" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111110" }}>{p.name}</span>
                  {p.category && <span style={{ fontSize: "0.75rem", color: "#6b6a66", background: "#eceae4", padding: "2px 8px", borderRadius: 100 }}>{p.category}</span>}
                  <StatusBadge part={p} />
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.82rem", color: "#444441" }}>{p.quantity} {p.unit} in stock</span>
                  <span style={{ fontSize: "0.82rem", color: "#6b6a66" }}>Reorder at {p.reorderLevel}</span>
                  {p.supplier && <span style={{ fontSize: "0.82rem", color: "#6b6a66" }}>{p.supplier}</span>}
                  {p.costPrice !== null && <span style={{ fontSize: "0.82rem", color: "#6b6a66" }}>£{p.costPrice.toFixed(2)}/unit</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setMode({ edit: p })} style={{ background: "#111110", color: "#ffffff", padding: "7px 16px", borderRadius: 100, fontWeight: 600, fontSize: "0.8rem", border: "none", cursor: "pointer" }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(p.id)} style={{ background: "transparent", color: "#6b6a66", padding: "7px 16px", borderRadius: 100, fontWeight: 600, fontSize: "0.8rem", border: "0.5px solid rgba(0,0,0,0.15)", cursor: "pointer" }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

const card: React.CSSProperties = { background: "#f4f3ef", borderRadius: 14, padding: "20px 22px" }
const cardTitle: React.CSSProperties = { fontWeight: 700, fontSize: "0.875rem", color: "#111110", marginBottom: 14 }
const lbl: React.CSSProperties = { fontWeight: 600, fontSize: "0.82rem", color: "#444441", display: "block", marginBottom: 5 }
const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "9px 12px", fontSize: "0.875rem", background: "#ffffff", color: "#111110", boxSizing: "border-box" }
const heading: React.CSSProperties = { fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em", color: "#111110" }
const errorBox: React.CSSProperties = { background: "#fee2e2", color: "#991b1b", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: "0.875rem", fontWeight: 500 }
