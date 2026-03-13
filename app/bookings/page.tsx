import Navbar from "../components/Navbar"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "../lib/prisma"

export default async function Bookings() {
  const { userId } = await auth()

  const bookings = await prisma.booking.findMany({
    where: { clerkId: userId! },
    orderBy: { createdAt: "desc" }
  })

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-500 mb-8">View and manage your garage bookings</p>
        {bookings.length === 0 ? (
          <p className="text-gray-500">No bookings yet — find a garage to get started!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 shadow-md">
                <p className="font-bold text-lg">{booking.service}</p>
                <p className="text-gray-500">📅 {new Date(booking.date).toLocaleDateString()}</p>
                <p className="text-gray-500">Garage ID: {booking.garageId}</p>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}