import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.garage.createMany({
    data: [
      {
        name: "Bens Garage",
        location: "Manchester",
        rating: 4.5,
        services: ["MOT", "Full Service", "Oil Change"],
      },
      {
        name: "City Motors",
        location: "Birmingham",
        rating: 3.8,
        services: ["MOT", "Tyres", "Brakes"],
      },
      {
        name: "Quick Fix",
        location: "London",
        rating: 4.9,
        services: ["MOT", "Diagnostics", "Welding"],
      },
      {
        name: "Northern Autos",
        location: "Leeds",
        rating: 4.2,
        services: ["Full Service", "Oil Change", "Brakes"],
      },
      {
        name: "Premier Garage",
        location: "Edinburgh",
        rating: 4.7,
        services: ["MOT", "Full Service", "Diagnostics"],
      },
    ],
  })
  console.log("Database seeded!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())