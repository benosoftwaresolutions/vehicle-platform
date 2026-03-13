"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type BookingFormProps = {
  garageId: string
}

export default function BookingForm({ garageId }: BookingFormProps) {
  const router = useRouter()
  const [service, setService] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleBooking = async () => {
    if (!service || !date) return

    setLoading(true)

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ garageId, service, date })
    })

    if (res.ok) {
      setSuccess(true)
      router.refresh()
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 font-bold">
        ✅ Booking confirmed! View it in My Bookings.
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Book an Appointment</h2>
      <div className="flex flex-col gap-4">
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a service</option>
          <option value="MOT">MOT</option>
          <option value="Full Service">Full Service</option>
          <option value="Oil Change">Oil Change</option>
          <option value="Tyres">Tyres</option>
          <option value="Brakes">Brakes</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleBooking}
          disabled={loading || !service || !date}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold disabled:opacity-50"
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  )
}