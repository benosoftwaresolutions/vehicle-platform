import { PrismaClient } from "@prisma/client"

if (process.env.NEXT_PUBLIC_ENV === "production") {
  throw new Error("Never run the seed script against production")
}

const prisma = new PrismaClient()

// ---------------------------------------------------------------------------
// Deterministic fake Clerk IDs so re-seeding is idempotent
// ---------------------------------------------------------------------------
const OWNERS = [
  { clerkId: "seed_owner_1", name: "James Hartley",   email: "james@smithsgarage.co.uk" },
  { clerkId: "seed_owner_2", name: "Priya Sharma",    email: "priya@northernauto.co.uk" },
  { clerkId: "seed_owner_3", name: "Mark O'Brien",    email: "mark@capitalcars.co.uk" },
  { clerkId: "seed_owner_4", name: "Karen Fletcher",  email: "karen@yorkshiremotors.co.uk" },
  { clerkId: "seed_owner_5", name: "Alistair Munroe", email: "alistair@scotiaautomotive.co.uk" },
]

const CUSTOMERS = [
  { clerkId: "seed_customer_1", name: "Tom Richards",   email: "tom.richards@example.com" },
  { clerkId: "seed_customer_2", name: "Sophie Bennett", email: "sophie.bennett@example.com" },
  { clerkId: "seed_customer_3", name: "Daniel Park",    email: "daniel.park@example.com" },
]

const GARAGES = [
  {
    name: "Smith's Garage",
    address: "14 Digbeth High Street",
    city: "Birmingham",
    postcode: "B5 6DY",
    description: "A family-run garage serving Birmingham since 1987. Specialists in BMW and Mini, with a full MOT bay and same-day service slots available most weeks.",
    email: "james@smithsgarage.co.uk",
    phone: "0121 456 7890",
    services: ["MOT", "Service", "Brakes", "Diagnostics"],
    specialistMakes: ["BMW", "Mini"],
    rating: 4.8,
    approved: true,
  },
  {
    name: "Northern Auto Works",
    address: "77 Deansgate",
    city: "Manchester",
    postcode: "M3 2BW",
    description: "Fully equipped workshop in central Manchester. We service all makes and models, with a specialisation in Ford and Vauxhall fleet vehicles.",
    email: "priya@northernauto.co.uk",
    phone: "0161 234 5678",
    services: ["MOT", "Service", "Tyres", "Diagnostics", "Exhausts"],
    specialistMakes: ["Ford", "Vauxhall"],
    rating: 4.5,
    approved: true,
  },
  {
    name: "Capital Cars",
    address: "32 Mare Street",
    city: "London",
    postcode: "E8 4RP",
    description: "East London's go-to workshop for premium European vehicles. We handle everything from routine servicing to complex diagnostics on Mercedes, BMW and Audi.",
    email: "mark@capitalcars.co.uk",
    phone: "020 7946 1234",
    services: ["MOT", "Service", "Brakes", "Diagnostics", "Air Conditioning"],
    specialistMakes: ["Mercedes", "BMW", "Audi"],
    rating: 4.7,
    approved: true,
  },
  {
    name: "Yorkshire Motors",
    address: "5 The Headrow",
    city: "Leeds",
    postcode: "LS1 6PU",
    description: "Leeds' trusted workshop for 4x4s and prestige vehicles. We have factory-level diagnostic equipment for Land Rover and Jaguar, plus full MOT facilities.",
    email: "karen@yorkshiremotors.co.uk",
    phone: "0113 345 6789",
    services: ["MOT", "Service", "Tyres", "Brakes", "Exhausts"],
    specialistMakes: ["Land Rover", "Jaguar"],
    rating: 4.3,
    approved: true,
  },
  {
    name: "Scotia Automotive",
    address: "88 Lothian Road",
    city: "Edinburgh",
    postcode: "EH3 9BZ",
    description: "Edinburgh's specialist VW Group workshop. We use genuine parts and manufacturer-approved procedures for all Volkswagen, Audi and Skoda vehicles.",
    email: "alistair@scotiaautomotive.co.uk",
    phone: "0131 567 8901",
    services: ["MOT", "Service", "Diagnostics", "Air Conditioning", "Brakes"],
    specialistMakes: ["Volkswagen", "Audi", "Skoda"],
    rating: 4.6,
    approved: true,
  },
]

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const SATURDAY = "Saturday"
const SUNDAY = "Sunday"

function weekdaySchedule(availabilityId: string) {
  return [
    ...WEEKDAYS.map(day => ({ availabilityId, day, isOpen: true, startTime: "09:00", endTime: "17:00" })),
    { availabilityId, day: SATURDAY, isOpen: true, startTime: "09:00", endTime: "13:00" },
    { availabilityId, day: SUNDAY, isOpen: false, startTime: "09:00", endTime: "17:00" },
  ]
}

function daysAgo(n: number) { const d = new Date(); d.setDate(d.getDate() - n); return d }
function daysFromNow(n: number) { const d = new Date(); d.setDate(d.getDate() + n); return d }

async function main(reset = false) {
  if (reset) {
    console.log("Resetting database…")
    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.daySchedule.deleteMany(),
      prisma.garageAvailability.deleteMany(),
      prisma.serviceType.deleteMany(),
      prisma.vehicle.deleteMany(),
      prisma.user.deleteMany({ where: { clerkId: { startsWith: "seed_" } } }),
      prisma.garage.deleteMany({ where: { email: { in: GARAGES.map(g => g.email!) } } }),
    ])
  }

  console.log("Seeding garages…")
  const garageRecords = await Promise.all(
    GARAGES.map(g => prisma.garage.create({ data: g }))
  )

  console.log("Seeding availability…")
  for (const garage of garageRecords) {
    const avail = await prisma.garageAvailability.create({
      data: { garageId: garage.id, slotDuration: 60, capacity: 2 },
    })
    await prisma.daySchedule.createMany({ data: weekdaySchedule(avail.id) })
  }

  console.log("Seeding garage owners…")
  const ownerRecords = await Promise.all(
    OWNERS.map((o, i) => prisma.user.upsert({
      where: { clerkId: o.clerkId },
      update: {},
      create: { ...o, role: "garage_owner", garageId: garageRecords[i].id, profileComplete: true },
    }))
  )

  console.log("Seeding customers…")
  const customerRecords = await Promise.all(
    CUSTOMERS.map(c => prisma.user.upsert({
      where: { clerkId: c.clerkId },
      update: {},
      create: { ...c, role: "customer", profileComplete: true },
    }))
  )

  console.log("Seeding bookings…")
  const [smiths, northern, capital, yorkshire, scotia] = garageRecords
  const [tom, sophie, daniel] = customerRecords

  const bookings = [
    // Confirmed upcoming
    { garageId: smiths.id, clerkId: tom.clerkId, service: "MOT", date: daysFromNow(5), time: "09:00", registration: "AB21 XYZ", status: "confirmed" },
    { garageId: capital.id, clerkId: sophie.clerkId, service: "Service", date: daysFromNow(12), time: "10:00", registration: "CD19 LMN", status: "confirmed" },
    { garageId: northern.id, clerkId: daniel.clerkId, service: "Diagnostics", date: daysFromNow(3), time: "14:00", registration: "EF22 PQR", status: "confirmed" },
    // Pending
    { garageId: yorkshire.id, clerkId: tom.clerkId, service: "Brakes", date: daysFromNow(8), time: "11:00", registration: "AB21 XYZ", status: "pending" },
    { garageId: scotia.id, clerkId: sophie.clerkId, service: "Air Conditioning", date: daysFromNow(15), time: "13:00", registration: "CD19 LMN", status: "pending" },
    // Completed (past)
    { garageId: smiths.id, clerkId: sophie.clerkId, service: "Service", date: daysAgo(30), time: "09:00", registration: "CD19 LMN", status: "confirmed" },
    { garageId: capital.id, clerkId: tom.clerkId, service: "Brakes", date: daysAgo(60), time: "10:00", registration: "AB21 XYZ", status: "confirmed" },
    { garageId: northern.id, clerkId: sophie.clerkId, service: "MOT", date: daysAgo(90), time: "09:00", registration: "CD19 LMN", status: "confirmed" },
    // Declined
    { garageId: yorkshire.id, clerkId: daniel.clerkId, service: "Tyres", date: daysAgo(14), time: "11:00", registration: "EF22 PQR", status: "declined" },
    // Cancelled by customer
    { garageId: scotia.id, clerkId: tom.clerkId, service: "Diagnostics", date: daysAgo(7), time: "15:00", registration: "AB21 XYZ", status: "declined_by_customer" },
  ]

  await prisma.booking.createMany({ data: bookings })

  console.log("Seeding reviews…")
  const reviews = [
    { garageId: smiths.id, clerkId: sophie.clerkId, customerName: "Sophie B.", rating: 5, comment: "Brilliant service — in and out in under an hour. The team is friendly and they explained everything clearly. Will definitely be back." },
    { garageId: smiths.id, clerkId: tom.clerkId, customerName: "Tom R.", rating: 5, comment: "Sorted my MOT with no issues. Honest, fair pricing and no upselling. Exactly what you want from a local garage." },
    { garageId: capital.id, clerkId: tom.clerkId, customerName: "Tom R.", rating: 5, comment: "These guys really know Mercedes. Fixed an issue two other garages couldn't diagnose. Worth every penny." },
    { garageId: northern.id, clerkId: sophie.clerkId, customerName: "Sophie B.", rating: 4, comment: "Good service overall. Took slightly longer than expected but they kept me updated throughout." },
    { garageId: yorkshire.id, clerkId: tom.clerkId, customerName: "Tom R.", rating: 4, comment: "Solid work on my Range Rover. The booking system made it really easy — no phone calls needed." },
    { garageId: yorkshire.id, clerkId: sophie.clerkId, customerName: "Sophie B.", rating: 4, comment: "Competitive pricing and the job was done on time. Would use again." },
    { garageId: scotia.id, clerkId: daniel.clerkId, customerName: "Daniel P.", rating: 5, comment: "As a VW enthusiast I was impressed by their knowledge and equipment. Proper specialists — not a chain." },
    { garageId: capital.id, clerkId: daniel.clerkId, customerName: "Daniel P.", rating: 5, comment: "Top notch diagnostics. Found a fault my main dealer missed. Highly recommend." },
  ]

  // Filter out any that reference undefined garages (the typo above)
  for (const r of reviews) {
    if (!r.garageId) continue
    await prisma.review.upsert({
      where: { garageId_clerkId: { garageId: r.garageId, clerkId: r.clerkId } },
      update: {},
      create: r,
    })
  }

  // Recalculate ratings
  console.log("Recalculating ratings…")
  for (const garage of garageRecords) {
    const agg = await prisma.review.aggregate({ where: { garageId: garage.id }, _avg: { rating: true } })
    if (agg._avg.rating != null) {
      await prisma.garage.update({
        where: { id: garage.id },
        data: { rating: Math.round(agg._avg.rating * 10) / 10 },
      })
    }
  }

  const counts = {
    garages: garageRecords.length,
    owners: ownerRecords.length,
    customers: customerRecords.length,
    bookings: bookings.length,
  }
  console.log("Seed complete:", counts)
}

const reset = process.argv.includes("--reset")
main(reset)
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
