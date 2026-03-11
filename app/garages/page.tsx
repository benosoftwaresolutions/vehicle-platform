"use client"

import { useState } from "react"
import Navbar from "@/app/components/Navbar"

export default function Garages() {
  const [search, setSearch] = useState("")

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Find a Garage</h1>
        <p className="text-gray-500 mb-8">Search for a garage near you</p>
        <input
          type="text"
          placeholder="Search by location or service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <p className="mt-4 text-gray-500">Searching for: <span className="font-bold text-blue-600">{search}</span></p>
        )}
      </main>
    </>
  )
}