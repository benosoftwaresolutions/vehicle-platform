import Navbar from "../components/Navbar"
import GaragesSearch from "./GaragesSearch"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "../lib/prisma"

export default async function Garages() {
  const { userId } = await auth()
  const user = userId
    ? await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } })
    : null

  return (
    <>
      <Navbar role={user?.role} />
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Find a Garage</h1>
        <p className="text-gray-500 mb-8">Search for a garage near you</p>
        <GaragesSearch />
      </main>
    </>
  )
}
