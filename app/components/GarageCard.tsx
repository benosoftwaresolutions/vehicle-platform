"use client"

import { useState } from "react"
import Link from "next/link"

type GarageCardProps = {
  id: string
  name: string
  location: string
  rating: string
  reviewCount: number
  services: string
}

export default function GarageCard({ id, name, location, rating, reviewCount, services }: GarageCardProps) {
  const [favourited, setFavourited] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
      <div className="bg-gray-100 h-40 flex items-center justify-center">
        <span className="text-5xl">🔧</span>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/garages/${id}`}>
            <h2 className="text-lg font-bold text-gray-900 hover:text-amber-500 transition">{name}</h2>
          </Link>
          <button onClick={() => setFavourited(!favourited)}>
            {favourited ? "❤️" : "🤍"}
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-1">📍 {location}</p>
        <p className="text-amber-500 text-sm font-medium mb-1">
          ⭐ {parseFloat(rating) > 0 ? `${rating}/5` : "No ratings yet"}
          {reviewCount > 0 && (
            <span className="text-gray-400 font-normal"> ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})</span>
          )}
        </p>
        <p className="text-gray-400 text-xs mb-3">{services || "No services listed"}</p>
        <Link href={`/garages/${id}`} className="mt-4 block text-center bg-gray-900 text-white py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition">
          View Garage
        </Link>
      </div>
    </div>
  )
}
