import Navbar from "@/app/components/Navbar"
import BookingForm from "@/app/components/BookingForm"
import ReviewForm from "@/app/components/ReviewForm"
import { prisma } from "@/app/lib/prisma"
import { auth } from "@clerk/nextjs/server"

type Params = {
  params: Promise<{ id: string }>
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: "#f59e0b", letterSpacing: "2px" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: s <= Math.round(rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
      ))}
    </span>
  )
}

export default async function GarageDetail({ params }: Params) {
  const { id } = await params
  const { userId } = await auth()

  const [garage, user, reviews] = await Promise.all([
    prisma.garage.findUnique({ where: { id } }),
    userId ? prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } }) : null,
    prisma.review.findMany({ where: { garageId: id }, orderBy: { createdAt: "desc" } }),
  ])

  if (!garage) {
    return (
      <>
        <Navbar role={user?.role} />
        <main className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold">Garage not found</h1>
        </main>
      </>
    )
  }

  // Check review eligibility server-side
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
      <div style={{ background: "#f8f9fb", minHeight: "100vh" }}>
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "48px 32px" }}>
          <div className="max-w-5xl mx-auto">
            <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
              <a href="/" style={{ color: "#94a3b8" }}>Home</a> → <a href="/garages" style={{ color: "#94a3b8" }}>Garages</a> → {garage.name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "0.5rem" }}>
              {garage.logoUrl && (
                <div style={{ width: 64, height: 64, borderRadius: "12px", overflow: "hidden", border: "2px solid rgba(255,255,255,0.15)", flexShrink: 0 }}>
                  <img src={garage.logoUrl} alt={`${garage.name} logo`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <h1 style={{ color: "white", fontSize: "2.5rem", fontWeight: 800 }}>{garage.name}</h1>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "1.1rem", marginBottom: "12px" }}>📍 {garage.address}, {garage.city}, {garage.postcode}</p>
            {/* Rating summary in header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Stars rating={garage.rating} />
              <span style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>
                {reviewCount > 0 ? garage.rating.toFixed(1) : "No ratings yet"}
              </span>
              {reviewCount > 0 && (
                <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                  ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
              )}
            </div>
          </div>
        </div>

        <main className="max-w-5xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex flex-col gap-6">

              {/* Services */}
              <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "16px" }}>Services Offered</h2>
                {garage.services.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>This garage hasn&apos;t configured their services yet.</p>
                ) : (
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {garage.services.map((service) => (
                      <span key={service} style={{ background: "#fef3c7", color: "#92400e", padding: "6px 14px", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600 }}>
                        {service}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Specialist makes */}
              {garage.specialistMakes.length > 0 && (
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <h2 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "16px" }}>Specialist Makes</h2>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {garage.specialistMakes.map((make) => (
                      <span key={make} style={{ background: "#eff6ff", color: "#1e40af", padding: "6px 14px", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600 }}>
                        {make}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "16px" }}>Location</h2>
                <p style={{ color: "#64748b" }}>{garage.address}</p>
                <p style={{ color: "#64748b" }}>{garage.city}</p>
                <p style={{ color: "#64748b" }}>{garage.postcode}</p>
              </div>

              {/* About */}
              {garage.description && (
                <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <h2 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "16px" }}>About</h2>
                  <p style={{ color: "#64748b", lineHeight: 1.7 }}>{garage.description}</p>
                </div>
              )}

              {/* Reviews */}
              <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: "1.25rem", marginBottom: "4px" }}>
                      Reviews {reviewCount > 0 && <span style={{ color: "#64748b", fontWeight: 400, fontSize: "1rem" }}>({reviewCount})</span>}
                    </h2>
                    {reviewCount > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Stars rating={garage.rating} />
                        <span style={{ fontWeight: 700, color: "#0f172a" }}>{garage.rating.toFixed(1)}</span>
                        <span style={{ color: "#64748b", fontSize: "0.875rem" }}>out of 5</span>
                      </div>
                    )}
                  </div>
                  <a
                    href={googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      background: "white", border: "1px solid #e5e7eb",
                      color: "#374151", padding: "8px 16px", borderRadius: "8px",
                      fontWeight: 600, fontSize: "0.875rem", textDecoration: "none",
                    }}
                  >
                    <span>G</span> Review on Google
                  </a>
                </div>

                {/* Review form */}
                {canReview && (
                  <div style={{ background: "#f8f9fb", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "16px" }}>Leave a review</p>
                    <ReviewForm garageId={garage.id} />
                  </div>
                )}

                {/* Review list */}
                {reviews.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: "0.875rem" }}>No reviews yet. Be the first!</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {reviews.map((review) => (
                      <div key={review.id} style={{ borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{review.customerName}</span>
                            <div style={{ marginTop: "2px" }}>
                              <Stars rating={review.rating} />
                            </div>
                          </div>
                          <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                            {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <p style={{ color: "#374151", fontSize: "0.9rem", lineHeight: 1.6 }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Booking sidebar */}
            <div className="md:col-span-1">
              <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "sticky", top: "80px" }}>
                <BookingForm garageId={garage.id} services={garage.services} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
