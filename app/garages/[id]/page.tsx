import Link from "next/link"
import Navbar from "@/app/components/Navbar"
import BookingForm from "@/app/components/BookingForm"
import ReviewForm from "@/app/components/ReviewForm"
import { prisma } from "@/app/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { getCachedUser } from "@/app/lib/cache"
import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"

type Params = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const garage = await prisma.garage.findUnique({ where: { id }, select: { name: true, city: true, postcode: true, description: true } })
  if (!garage) return { title: "Garage not found — Fyca" }
  return {
    title: `${garage.name} — Fyca`,
    description: garage.description ?? `Book ${garage.name} in ${garage.city}. Fast, online garage booking with Fyca.`,
  }
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "#111110" : "#d1d0cb" }}>★</span>
      ))}
    </span>
  )
}

export default async function GarageDetail({ params }: Params) {
  const { id } = await params
  const { userId } = await auth()

  const [garage, user, reviews] = await Promise.all([
    prisma.garage.findUnique({ where: { id } }),
    userId ? getCachedUser(userId) : null,
    prisma.review.findMany({ where: { garageId: id }, orderBy: { createdAt: "desc" } }),
  ])

  if (!garage) notFound()

  let canReview = false
  if (userId) {
    const [confirmedBooking, existingReview] = await Promise.all([
      prisma.booking.findFirst({ where: { garageId: id, clerkId: userId, status: "confirmed" } }),
      prisma.review.findUnique({ where: { garageId_clerkId: { garageId: id, clerkId: userId } } }),
    ])
    canReview = !!confirmedBooking && !existingReview
  }

  const reviewCount = reviews.length
  const googleQuery = encodeURIComponent(`${garage.name} ${garage.address} ${garage.city}`)
  const googleReviewUrl = `https://search.google.com/local/writereview?query=${googleQuery}`

  return (
    <>
      <Navbar role={user?.role} />

      {/* Page header */}
      <div className="page-hd" style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)", padding: "48px 32px 36px", background: "#ffffff" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b6a66", marginBottom: "16px" }}>
            <Link href="/" style={{ color: "#6b6a66", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 6px" }}>→</span>
            <Link href="/garages" style={{ color: "#6b6a66", textDecoration: "none" }}>Garages</Link>
            <span style={{ margin: "0 6px" }}>→</span>
            {garage.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "12px" }}>
            {garage.logoUrl && (
              <div style={{ width: 56, height: 56, borderRadius: "12px", overflow: "hidden", border: "0.5px solid rgba(0,0,0,0.10)", flexShrink: 0, position: "relative" }}>
                <Image src={garage.logoUrl} alt={`${garage.name} logo`} fill sizes="56px" style={{ objectFit: "cover" }} />
              </div>
            )}
            <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.03em", color: "#111110" }}>
              {garage.name}
            </h1>
          </div>
          <p style={{ color: "#6b6a66", marginBottom: "12px" }}>{garage.address}, {garage.city}, {garage.postcode}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Stars rating={garage.rating} />
            <span style={{ fontWeight: 600, color: "#111110", fontSize: "0.9rem" }}>
              {reviewCount > 0 ? garage.rating.toFixed(1) : "No ratings yet"}
            </span>
            {reviewCount > 0 && (
              <span style={{ color: "#6b6a66", fontSize: "0.85rem" }}>
                ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="page-body" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 32px" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Services */}
            <div style={card}>
              <h2 style={h2}>Services Offered</h2>
              {(garage.services ?? []).length === 0 ? (
                <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>This garage hasn&apos;t configured their services yet.</p>
              ) : (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(garage.services ?? []).map((service) => (
                    <span key={service} style={{ background: "#eceae4", color: "#111110", padding: "5px 14px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 600 }}>
                      {service}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Specialist makes */}
            {(garage.specialistMakes ?? []).length > 0 && (
              <div style={card}>
                <h2 style={h2}>Specialist Makes</h2>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {(garage.specialistMakes ?? []).map((make) => (
                    <span key={make} style={{ background: "#eceae4", color: "#111110", padding: "5px 14px", borderRadius: 100, fontSize: "0.8rem", fontWeight: 600 }}>
                      {make}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div style={card}>
              <h2 style={h2}>Location</h2>
              <p style={{ color: "#444441" }}>{garage.address}</p>
              <p style={{ color: "#444441" }}>{garage.city}</p>
              <p style={{ color: "#444441" }}>{garage.postcode}</p>
            </div>

            {/* Contact — phone only. The garage email is held for booking
                notifications and admin use, never shown publicly. */}
            {garage.phone && (
              <div style={card}>
                <h2 style={h2}>Contact</h2>
                <p style={{ color: "#444441" }}>
                  <a href={`tel:${garage.phone.replace(/\s+/g, "")}`} style={{ color: "#111110" }}>{garage.phone}</a>
                </p>
              </div>
            )}

            {/* About */}
            {garage.description && (
              <div style={card}>
                <h2 style={h2}>About</h2>
                <p style={{ color: "#444441", lineHeight: 1.7 }}>{garage.description}</p>
              </div>
            )}

            {/* Reviews */}
            <div style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ ...h2, marginBottom: "6px" }}>
                    Reviews{reviewCount > 0 && <span style={{ color: "#6b6a66", fontWeight: 400, fontSize: "1rem" }}> ({reviewCount})</span>}
                  </h2>
                  {reviewCount > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Stars rating={garage.rating} />
                      <span style={{ fontWeight: 600, color: "#111110" }}>{garage.rating.toFixed(1)}</span>
                      <span style={{ color: "#6b6a66", fontSize: "0.85rem" }}>out of 5</span>
                    </div>
                  )}
                </div>
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px",
                    background: "#f4f3ef", border: "0.5px solid rgba(0,0,0,0.12)",
                    color: "#444441", padding: "8px 16px", borderRadius: 100,
                    fontWeight: 600, fontSize: "0.8rem", textDecoration: "none",
                  }}
                >
                  <span style={{ fontWeight: 800 }}>G</span> Review on Google
                </a>
              </div>

              {/* Review form */}
              {canReview && (
                <div style={{ background: "#f4f3ef", borderRadius: 10, padding: "20px", marginBottom: "24px" }}>
                  <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111110", marginBottom: "16px" }}>Leave a review</p>
                  <ReviewForm garageId={garage.id} />
                </div>
              )}

              {/* Review list */}
              {reviews.length === 0 ? (
                <p style={{ color: "#6b6a66", fontSize: "0.875rem" }}>No reviews yet. Be the first!</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {reviews.map((review) => (
                    <div key={review.id} style={{ borderTop: "0.5px solid rgba(0,0,0,0.08)", paddingTop: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#111110" }}>{review.customerName}</span>
                          <div style={{ marginTop: "3px" }}>
                            <Stars rating={review.rating} />
                          </div>
                        </div>
                        <span style={{ color: "#6b6a66", fontSize: "0.8rem" }}>
                          {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p style={{ color: "#444441", fontSize: "0.9rem", lineHeight: 1.6 }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Booking sidebar */}
          <div className="md:col-span-1">
            <div style={{ ...card, position: "sticky", top: "72px" }}>
              <BookingForm garageId={garage.id} services={garage.services ?? []} servicePricing={(garage.servicePricing as Record<string, { min: number | null; max: number | null }> | null) ?? {}} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

const card: React.CSSProperties = { background: "#f4f3ef", borderRadius: 14, padding: "24px" }
const h2: React.CSSProperties = { fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111110", marginBottom: "16px" }
