import GarageCard from "./components/GarageCard"
import Navbar from "./components/Navbar"
import { prisma } from "./lib/prisma"

export default async function Home() {
  const garages = await prisma.garage.findMany()

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Vehicle Platform</h1>
        <p className="text-gray-500 mb-8">Find and book a garage near you</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {garages.map((garage) => (
            <GarageCard
              key={garage.id}
              id={garage.id}
              name={garage.name}
              location={garage.location}
              rating={garage.rating.toString()}
              services={garage.services.join(", ")}
            />
          ))}
        </div>
      </main>
    </>
  )
}