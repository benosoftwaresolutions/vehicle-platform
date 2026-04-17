"use client"

import { useState } from "react"

export default function GaragesSearch() {
  const [search, setSearch] = useState("")

  return (
    <>
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
    </>
  )
}
