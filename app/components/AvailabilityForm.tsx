"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

type DaySchedule = {
  day: string
  isOpen: boolean
  startTime: string
  endTime: string
}

type AvailabilityFormProps = {
  garageId: string
  existing: {
    slotDuration: number
    capacity: number
    schedule: DaySchedule[]
  } | null
}

const defaultSchedule: DaySchedule[] = days.map(day => ({
  day,
  isOpen: !["Saturday", "Sunday"].includes(day),
  startTime: "08:00",
  endTime: "17:00"
}))

export default function AvailabilityForm({ garageId, existing }: AvailabilityFormProps) {
  const router = useRouter()
  const [slotDuration, setSlotDuration] = useState(existing?.slotDuration || 60)
  const [capacity, setCapacity] = useState(existing?.capacity || 2)
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    existing?.schedule.length ? existing.schedule : defaultSchedule
  )
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const updateDay = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prev => prev.map(d => d.day === day ? { ...d, [field]: value } : d))
  }

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garageId, slotDuration, capacity, schedule })
    })
    if (res.ok) {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{display: "flex", flexDirection: "column", gap: "24px"}}>
      {success && (
        <div style={{background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "16px", color: "#166534", fontWeight: 700}}>
          ✅ Availability saved successfully!
        </div>
      )}

      <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
        <h2 style={{fontWeight: 700, fontSize: "1.1rem", marginBottom: "20px"}}>General Settings</h2>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px"}}>
          <div>
            <label style={{fontWeight: 600, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Slot Duration</label>
            <select
              value={slotDuration}
              onChange={e => setSlotDuration(Number(e.target.value))}
              style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}}
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
          <div>
            <label style={{fontWeight: 600, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Daily Capacity (vehicles)</label>
            <input
              type="number"
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
              min={1}
              max={20}
              style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}}
            />
          </div>
        </div>
      </div>

      <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
        <h2 style={{fontWeight: 700, fontSize: "1.1rem", marginBottom: "20px"}}>Opening Hours</h2>
        <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          {schedule.map(day => (
            <div key={day.day} style={{display: "grid", gridTemplateColumns: "120px 80px 1fr 1fr", alignItems: "center", gap: "16px"}}>
              <span style={{fontWeight: 600, fontSize: "0.95rem"}}>{day.day}</span>
              <label style={{display: "flex", alignItems: "center", gap: "8px", cursor: "pointer"}}>
                <input
                  type="checkbox"
                  checked={day.isOpen}
                  onChange={e => updateDay(day.day, "isOpen", e.target.checked)}
                />
                <span style={{fontSize: "0.875rem", color: day.isOpen ? "#0f172a" : "#94a3b8"}}>
                  {day.isOpen ? "Open" : "Closed"}
                </span>
              </label>
              {day.isOpen ? (
                <>
                  <div>
                    <label style={{fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px"}}>Opens</label>
                    <input
                      type="time"
                      value={day.startTime}
                      onChange={e => updateDay(day.day, "startTime", e.target.value)}
                      style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px"}}
                    />
                  </div>
                  <div>
                    <label style={{fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: "4px"}}>Closes</label>
                    <input
                      type="time"
                      value={day.endTime}
                      onChange={e => updateDay(day.day, "endTime", e.target.value)}
                      style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "8px 12px"}}
                    />
                  </div>
                </>
              ) : (
                <span style={{color: "#94a3b8", fontSize: "0.875rem", gridColumn: "span 2"}}>Closed all day</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{background: "#0f172a", color: "white", padding: "14px 32px", borderRadius: "10px", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer", width: "100%"}}
      >
        {loading ? "Saving..." : "Save Availability"}
      </button>
    </div>
  )
}