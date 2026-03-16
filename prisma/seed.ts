import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaultServices = [
  { name: "MOT", duration: 60, price: 54.85, description: "Annual MOT test" },
  { name: "Full Service", duration: 180, price: 149.99, description: "Comprehensive vehicle service" },
  { name: "Oil Change", duration: 30, price: 49.99, description: "Engine oil and filter change" },
  { name: "Tyres", duration: 60, price: 0, description: "Tyre fitting and balancing" },
  { name: "Brakes", duration: 90, price: 0, description: "Brake inspection and replacement" },
  { name: "Diagnostics", duration: 60, price: 49.99, description: "Full diagnostic check" },
  { name: "Welding", duration: 120, price: 0, description: "Exhaust and bodywork welding" },
]

async function main() {
  // Clear existing data
  await prisma.serviceType.deleteMany()
  await prisma.garage.deleteMany()

  // Seed garages
  const garages = await Promise.all([
    prisma.garage.create({
      data: {
        name: "Bens Garage",
        address: "123 Deansgate",
        city: "Manchester",
        postcode: "M3 4LQ",
        rating: 4.5,
        services: ["MOT", "Full Service", "Oil Change"],
      }
    }),
    prisma.garage.create({
      data: {
        name: "City Motors",
        address: "45 Broad Street",
        city: "Birmingham",
        postcode: "B1 2HP",
        rating: 3.8,
        services: ["MOT", "Tyres", "Brakes"],
      }
    }),
    prisma.garage.create({
      data: {
        name: "Quick Fix",
        address: "78 Old Street",
        city: "London",
        postcode: "EC1V 9AX",
        rating: 4.9,
        services: ["MOT", "Diagnostics", "Welding"],
      }
    }),
    prisma.garage.create({
      data: {
        name: "Northern Autos",
        address: "12 Kirkgate",
        city: "Leeds",
        postcode: "LS1 6BR",
        rating: 4.2,
        services: ["Full Service", "Oil Change", "Brakes"],
      }
    }),
    prisma.garage.create({
      data: {
        name: "Premier Garage",
        address: "56 Princes Street",
        city: "Edinburgh",
        postcode: "EH2 2DQ",
        rating: 4.7,
        services: ["MOT", "Full Service", "Diagnostics"],
      }
    }),
  ])

  // Seed default service types for each garage
  for (const garage of garages) {
    await prisma.serviceType.createMany({
      data: defaultServices.map(service => ({
        ...service,
        garageId: garage.id
      }))
    })
  }

  console.log("Database seeded!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())