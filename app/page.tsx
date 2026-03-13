import GarageCard from "./components/GarageCard"
import Navbar from "./components/Navbar"
import { prisma } from "./lib/prisma"

export default async function Home() {
  const garages = await prisma.garage.findMany()

  return (
    <>
      <Navbar />
      <section className="bg-gray-900 text-white py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Find and book a garage <br />
            <span className="text-amber-400">near you</span>
          </h1>
          <p className="text-gray-400 text-xl mb-8">Skip the phone calls. Book your vehicle service online in minutes.</p>
          <a href="/garages" className="bg-amber-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber-300 transition inline-block">
            Find a Garage
          </a>
        </div>
      </section>
      <main className="max-w-5xl mx-auto px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Garages</h2>
        <p className="text-gray-500 mb-8">Trusted garages available to book today</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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