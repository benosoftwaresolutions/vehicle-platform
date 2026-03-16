"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type AvailabilityFormProps = {
  garageId: string
  existing: {
    workingDays: string[]
    startTime: string
    endTime: string
    slotDuration: number
    capacity: number
  } | null
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function AvailabilityForm({ garageId, existing }: AvailabilityFormProps) {
  const router = useRouter()
  const [workingDays, setWorkingDays] = useState<string[]>(existing?.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"])
  const [startTime, setStartTime] = useState(existing?.startTime || "08:00")
  const [endTime, setEndTime] = useState(existing?.endTime || "17:00")
  const [slotDuration, setSlotDuration] = useState(existing?.slotDuration || 60)
  const [capacity, setCapacity] = useState(existing?.capacity || 2)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggleDay = (day: string) => {
    setWorkingDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garageId, workingDays, startTime, endTime, slotDuration, capacity })
    })
    if (res.ok) {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{background: "white", borderRadius: "16px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
      {success && (
        <div style={{background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "12px", padding: "16px", color: "#166534", fontWeight: 700, marginBottom: "24px"}}>
          ✅ Availability saved successfully!
        </div>
      )}
      <div style={{marginBottom: "24px"}}>
        <label style={{fontWeight: 700, fontSize: "1rem", display: "block", marginBottom: "12px"}}>Working Days</label>
        <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
          {days.map(day => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              style={{
                padding: "8px 16px",
                borderRadius: "999px",
                border: "2px solid",
                borderColor: workingDays.includes(day) ? "#0f172a" : "#e5e7eb",
                background: workingDays.includes(day) ? "#0f172a" : "white",
                color: workingDays.includes(day) ? "white" : "#64748b",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer"
              }}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px"}}>
        <div>
          <label style={{fontWeight: 700, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}}
          />
        </div>
        <div>
          <label style={{fontWeight: 700, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}}
          />
        </div>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px"}}>
        <div>
          <label style={{fontWeight: 700, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Slot Duration</label>
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
          <label style={{fontWeight: 700, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Daily Capacity</label>
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