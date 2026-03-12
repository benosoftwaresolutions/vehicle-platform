"use client"

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"

export default function Navbar() {
  const { isSignedIn } = useAuth()

  return (
    <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-blue-600">🚗 VehiclePlatform</Link>
      <div className="flex gap-4 items-center">
        <Link href="/" className="text-gray-600 hover:text-blue-600 transition">Home</Link>
        <Link href="/garages" className="text-gray-600 hover:text-blue-600 transition">Garages</Link>
        <Link href="/bookings" className="text-gray-600 hover:text-blue-600 transition">My Bookings</Link>
        {!isSignedIn ? (
          <>
            <SignInButton mode="modal">
              <button className="text-gray-600 hover:text-blue-600 transition">Login</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Sign Up</button>
            </SignUpButton>
          </>
        ) : (
          <UserButton />
        )}
      </div>
    </nav>
  )
}