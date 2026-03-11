export default function Navbar() {
    return (
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">🚗 VehiclePlatform</h1>
        <div className="flex gap-4">
          <a href="/" className="text-gray-600 hover:text-blue-600 transition">Home</a>
          <a href="/garages" className="text-gray-600 hover:text-blue-600 transition">Garages</a>
          <a href="/bookings" className="text-gray-600 hover:text-blue-600 transition">My Bookings</a>
          <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Login</a>
        </div>
      </nav>
    )
  }