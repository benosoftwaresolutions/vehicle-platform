import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.garage.createMany({
    data: [
      {
        name: "Bens Garage",
        address: "123 Deansgate",
        city: "Manchester",
        postcode: "M3 4LQ",
        rating: 4.5,
        services: ["MOT", "Full Service", "Oil Change"],
      },
      {
        name: "City Motors",
        address: "45 Broad Street",
        city: "Birmingham",
        postcode: "B1 2HP",
        rating: 3.8,
        services: ["MOT", "Tyres", "Brakes"],
      },
      {
        name: "Quick Fix",
        address: "78 Old Street",
        city: "London",
        postcode: "EC1V 9AX",
        rating: 4.9,
        services: ["MOT", "Diagnostics", "Welding"],
      },
      {
        name: "Northern Autos",
        address: "12 Kirkgate",
        city: "Leeds",
        postcode: "LS1 6BR",
        rating: 4.2,
        services: ["Full Service", "Oil Change", "Brakes"],
      },
      {
        name: "Premier Garage",
        address: "56 Princes Street",
        city: "Edinburgh",
        postcode: "EH2 2DQ",
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