"use client"

import { useState, useEffect } from "react"

function GarageCard({ name, location, rating, services }: { name: string, location: string, rating: string, services: string }) {
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

export default function Home() {
  const [garages, setGarages] = useState([])

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then(res => res.json())
      .then(data => setGarages(data))
  }, [])

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-2">Vehicle Platform</h1>
      <p className="text-gray-500 mb-8">Find and book a garage near you</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {garages.map((garage: any) => (
          <GarageCard
            key={garage.id}
            name={garage.name}
            location={garage.address.city}
            rating="4.5"
            services="MOT, Full Service"
          />
        ))}
      </div>
    </main>
  )
}