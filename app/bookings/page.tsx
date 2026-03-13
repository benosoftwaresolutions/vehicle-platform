import Navbar from "../components/Navbar"

export default function Bookings() {
  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-500 mb-8">View and manage your garage bookings</p>
      </main>
    </>
  )
}