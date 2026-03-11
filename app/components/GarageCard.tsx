"use client"

import { useState } from "react"

type GarageCardProps = {
  name: string
  location: string
  rating: string
  services: string
}

export default function GarageCard({ name, location, rating, services }: GarageCardProps) {
  const [favourited, setFavourited] = useState(false)

  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition">
      <h2 className="text-xl font-bold">{name}</h2>
      <p className="text-gray-500">📍 {location}</p>
      <p className="text-yellow-500">⭐ {rating}/5</p>
      <p className="text-gray-600 text-sm">🔧 {services}</p>
      <button
        onClick={() => setFavourited(!favourited)}
        className="mt-3 px-4 py-2 rounded-full bg-gray-100 hover:bg-red-100 transition"
      >
        {favourited ? "❤️ Favourited" : "🤍 Favourite"}
      </button>
    </div>
  )
}