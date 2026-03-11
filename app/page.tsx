"use client"

import { useState, useEffect } from "react"
import GarageCard from "./components/GarageCard"
import Navbar from "./components/Navbar" 

export default function Home() {
  const [garages, setGarages] = useState([])

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then(res => res.json())
      .then(data => setGarages(data))
  }, [])

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Vehicle Platform</h1>
        <p className="text-gray-500 mb-8">Find and book a garage near you</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {garages.map((garage: any) => (
  <GarageCard
    key={garage.id}
    id={garage.id}
    name={garage.name}
    location={garage.address.city}
    rating="4.5"
    services="MOT, Full Service"
  />
))}
        </div>
      </main>
    </>
  )
}