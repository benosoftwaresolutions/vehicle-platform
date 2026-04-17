"use client"

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs"
import Link from "next/link"

type NavbarProps = {
  role?: string
}

export default function Navbar({ role }: NavbarProps) {
  const { isSignedIn } = useAuth()
  const isGarageOwner = role === "garage_owner"

  return (
    <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <Link href="/" className="text-xl font-extrabold tracking-tight">
        <span className="text-gray-900">Vehicle</span><span className="text-amber-400">Platform</span>
      </Link>
      <div className="flex gap-6 items-center">
        <Link href="/" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">Home</Link>
        <Link href="/garages" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">Garages</Link>
        {isGarageOwner ? (
          <Link href="/garage-dashboard" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">Garage Dashboard</Link>
        ) : (
          <Link href="/bookings" className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">My Bookings</Link>
        )}
        {!isSignedIn ? (
          <>
            <SignInButton mode="modal">
              <button className="text-gray-500 hover:text-gray-900 transition text-sm font-medium">Login</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-gray-900 text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition text-sm font-bold">
                Sign Up
              </button>
            </SignUpButton>
          </>
        ) : (
          <UserButton />
        )}
      </div>
    </nav>
  )
}