import Navbar from "@/app/components/Navbar"
import BookingForm from "@/app/components/BookingForm"
import { prisma } from "@/app/lib/prisma"

type Params = {
  params: Promise<{
    id: string
  }>
}

export default async function GarageDetail({ params }: Params) {
  const { id } = await params
  const garage = await prisma.garage.findUnique({
    where: { id }
  })

  if (!garage) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto p-8">
          <h1 className="text-4xl font-bold">Garage not found</h1>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div style={{background: "#f8f9fb", minHeight: "100vh"}}>
        <div style={{background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "48px 32px"}}>
          <div className="max-w-5xl mx-auto">
            <p style={{color: "#94a3b8", fontSize: "0.875rem", marginBottom: "0.5rem"}}>
              <a href="/" style={{color: "#94a3b8"}}>Home</a> → <a href="/garages" style={{color: "#94a3b8"}}>Garages</a> → {garage.name}
            </p>
            <h1 style={{color: "white", fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.5rem"}}>{garage.name}</h1>
            <p style={{color: "#94a3b8", fontSize: "1.1rem"}}>📍 {garage.address}, {garage.city}, {garage.postcode}</p>
          </div>
        </div>
        <main className="max-w-5xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 flex flex-col gap-6">
              <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
                <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "16px"}}>Services Offered</h2>
                <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                  {garage.services.map((service) => (
                    <span key={service} style={{background: "#fef3c7", color: "#92400e", padding: "6px 14px", borderRadius: "999px", fontSize: "0.875rem", fontWeight: 600}}>
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
                <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "16px"}}>Location</h2>
                <p style={{color: "#64748b"}}>{garage.address}</p>
                <p style={{color: "#64748b"}}>{garage.city}</p>
                <p style={{color: "#64748b"}}>{garage.postcode}</p>
              </div>
              <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
                <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "16px"}}>About</h2>
                <p style={{color: "#64748b", lineHeight: 1.7}}>A trusted local garage offering a wide range of vehicle services. Fully qualified technicians with years of experience serving the local community.</p>
              </div>
              <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
                <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "16px"}}>Rating</h2>
                <p style={{fontSize: "3rem", fontWeight: 800, color: "#f59e0b"}}>{garage.rating}/5 ⭐</p>
              </div>
            </div>
            <div className="md:col-span-1">
              <div style={{background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", position: "sticky", top: "80px"}}>
                <BookingForm garageId={garage.id} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}