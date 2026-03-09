"use client"

import { useState, useEffect } from "react"

function GarageCard({ name, location, rating, services }: { name: string, location: string, rating: string, services: string }) {
  const [favourited, setFavourited] = useState(false)

  return (
    <div>
      <h2>{name}</h2>
      <p>Location: {location}</p>
      <p>Rating: {rating}/5</p>
      <p>Services: {services}</p>
      <button onClick={() => setFavourited(!favourited)}>
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
    <main>
      <h1>Vehicle Platform</h1>
      <p>Find and book a garage near you</p>
      {garages.map((garage: any) => (
        <GarageCard
          key={garage.id}
          name={garage.name}
          location={garage.address.city}
          rating="4.5"
          services="MOT, Full Service"
        />
      ))}
    </main>
  )
}