import { prisma } from "@/app/lib/prisma"
import Link from "next/link"
import ApproveButton from "./ApproveButton"
import DeclineButton from "./DeclineButton"

export default async function AdminPending() {
  const pendingOwners = await prisma.user.findMany({
    where: { role: "pending", garageId: { not: null } },
    orderBy: { createdAt: "asc" },
  })

  const garageIds = pendingOwners.map((u) => u.garageId!)

  const garages = await prisma.garage.findMany({
    where: { id: { in: garageIds } },
  })
  const garageMap = Object.fromEntries(garages.map((g) => [g.id, g]))

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.6rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "4px" }}>
          Pending approvals
        </h1>
        <p style={{ color: "#6b6a66", fontSize: "0.9rem" }}>{pendingOwners.length} garage{pendingOwners.length !== 1 ? "s" : ""} awaiting approval</p>
      </div>

      {pendingOwners.length === 0 ? (
        <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "48px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", color: "#111110", marginBottom: "6px" }}>All clear</p>
          <p style={{ color: "#6b6a66" }}>No garages waiting for approval</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {pendingOwners.map((owner) => {
            const garage = garageMap[owner.garageId!]
            if (!garage) return null
            return (
              <div key={owner.id} style={{ background: "#ffffff", border: "0.5px solid rgba(0,0,0,0.1)", borderRadius: 14, padding: "24px 28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <h2 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", color: "#111110" }}>
                        {garage.name}
                      </h2>
                      <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 10px", borderRadius: 100, fontSize: "0.72rem", fontWeight: 700 }}>
                        Pending
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px 32px", marginBottom: "16px" }}>
                      <Field label="Address" value={`${garage.address}, ${garage.city}, ${garage.postcode}`} />
                      <Field label="Owner email" value={owner.email} />
                      <Field label="Owner name" value={owner.name ?? "—"} />
                      <Field label="Applied" value={new Date(owner.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} />
                    </div>

                    {garage.services.length > 0 && (
                      <div style={{ marginBottom: "12px" }}>
                        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Services</p>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {garage.services.map((s) => (
                            <span key={s} style={{ background: "#f4f3ef", color: "#444441", padding: "3px 10px", borderRadius: 100, fontSize: "0.78rem", fontWeight: 500 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {garage.specialistMakes.length > 0 && (
                      <div>
                        <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Specialist makes</p>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {garage.specialistMakes.map((m) => (
                            <span key={m} style={{ background: "#f4f3ef", color: "#444441", padding: "3px 10px", borderRadius: 100, fontSize: "0.78rem", fontWeight: 500 }}>{m}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {garage.description && (
                      <p style={{ color: "#6b6a66", fontSize: "0.875rem", marginTop: "12px", lineHeight: 1.6 }}>{garage.description}</p>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                    <Link
                      href={`/garages/${garage.id}`}
                      target="_blank"
                      style={{ background: "transparent", color: "#111110", border: "0.5px solid rgba(0,0,0,0.2)", padding: "9px 18px", borderRadius: 100, fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", textAlign: "center", whiteSpace: "nowrap" }}
                    >
                      View public page
                    </Link>
                    <ApproveButton userId={owner.id} garageName={garage.name} />
                    <DeclineButton userId={owner.id} garageId={garage.id} garageName={garage.name} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6b6a66", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>{label}</p>
      <p style={{ color: "#111110", fontSize: "0.875rem" }}>{value}</p>
    </div>
  )
}
