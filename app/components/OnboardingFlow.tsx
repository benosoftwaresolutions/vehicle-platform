"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type User = {
  clerkId: string
  role: string
  onboardingStep: number
  name: string | null
}

type OnboardingFlowProps = {
  user: User
}

export default function OnboardingFlow({ user }: OnboardingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(user.onboardingStep)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name || "")
  const [garageName, setGarageName] = useState("")
  const [garageAddress, setGarageAddress] = useState("")
  const [garageCity, setGarageCity] = useState("")
  const [garagePostcode, setGaragePostcode] = useState("")
  // Track role locally so step 2 renders the correct form regardless of the stale
  // user.role prop (which reflects the DB value at page-load time, before step 1 runs)
  const [selectedRole, setSelectedRole] = useState<string | null>(
    user.role !== "pending" ? user.role : null
  )

  const chooseRole = async (role: string) => {
    setLoading(true)
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 1, role })
    })
    setSelectedRole(role)
    setLoading(false)
    setStep(2)
  }

  const completeCustomer = async () => {
    setLoading(true)
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 2, name, role: "customer" })
    })
    setLoading(false)
    router.push("/")
  }

  const completeGarageDetails = async () => {
    setLoading(true)
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: 2,
        role: "garage_owner",
        name,
        garageName,
        garageAddress,
        garageCity,
        garagePostcode
      })
    })
    setLoading(false)
    router.push("/garage-dashboard")
  }

  // Step 0 — Choose role
  if (step === 0 || step === 1) {
    return (
      <div style={{minHeight: "100vh", background: "#f8f9fb", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px"}}>
        <div style={{maxWidth: "600px", width: "100%"}}>
          <div style={{textAlign: "center", marginBottom: "48px"}}>
            <h1 style={{fontSize: "2.5rem", fontWeight: 800, marginBottom: "12px"}}>
              Welcome to <span style={{color: "#f59e0b"}}>VehiclePlatform</span>
            </h1>
            <p style={{color: "#64748b", fontSize: "1.1rem"}}>How will you be using the platform?</p>
          </div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px"}}>
            <button
              onClick={() => chooseRole("customer")}
              disabled={loading}
              style={{background: "white", border: "2px solid #e5e7eb", borderRadius: "16px", padding: "32px 24px", cursor: "pointer", textAlign: "center", transition: "all 0.2s"}}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#0f172a")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <p style={{fontSize: "3rem", marginBottom: "16px"}}>🚗</p>
              <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "8px"}}>I need a garage</h2>
              <p style={{color: "#64748b", fontSize: "0.875rem"}}>Find and book garages for your vehicle</p>
            </button>
            <button
              onClick={() => chooseRole("garage_owner")}
              disabled={loading}
              style={{background: "white", border: "2px solid #e5e7eb", borderRadius: "16px", padding: "32px 24px", cursor: "pointer", textAlign: "center", transition: "all 0.2s"}}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#0f172a")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
            >
              <p style={{fontSize: "3rem", marginBottom: "16px"}}>🔧</p>
              <h2 style={{fontWeight: 700, fontSize: "1.25rem", marginBottom: "8px"}}>I own a garage</h2>
              <p style={{color: "#64748b", fontSize: "0.875rem"}}>List your garage and manage bookings</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2 — Customer profile
  if (step === 2 && selectedRole === "customer") {
    return (
      <div style={{minHeight: "100vh", background: "#f8f9fb", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px"}}>
        <div style={{maxWidth: "480px", width: "100%", background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
          <h1 style={{fontSize: "1.75rem", fontWeight: 800, marginBottom: "8px"}}>Your Profile</h1>
          <p style={{color: "#64748b", marginBottom: "32px"}}>Just a few details to get started</p>
          <div style={{marginBottom: "20px"}}>
            <label style={{fontWeight: 600, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}}
            />
          </div>
          <button
            onClick={completeCustomer}
            disabled={loading || !name}
            style={{background: "#0f172a", color: "white", padding: "14px 32px", borderRadius: "10px", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer", width: "100%"}}
          >
            {loading ? "Saving..." : "Get Started"}
          </button>
        </div>
      </div>
    )
  }

  // Step 2 — Garage owner details
  if (step === 2 && selectedRole === "garage_owner") {
    return (
      <div style={{minHeight: "100vh", background: "#f8f9fb", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px"}}>
        <div style={{maxWidth: "480px", width: "100%", background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
          <h1 style={{fontSize: "1.75rem", fontWeight: 800, marginBottom: "8px"}}>Your Garage</h1>
          <p style={{color: "#64748b", marginBottom: "32px"}}>Tell us about your garage</p>
          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
            <div>
              <label style={{fontWeight: 600, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}} />
            </div>
            <div>
              <label style={{fontWeight: 600, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Garage Name</label>
              <input type="text" value={garageName} onChange={e => setGarageName(e.target.value)} placeholder="e.g. Bens Garage" style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}} />
            </div>
            <div>
              <label style={{fontWeight: 600, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Street Address</label>
              <input type="text" value={garageAddress} onChange={e => setGarageAddress(e.target.value)} placeholder="123 High Street" style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}} />
            </div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
              <div>
                <label style={{fontWeight: 600, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>City</label>
                <input type="text" value={garageCity} onChange={e => setGarageCity(e.target.value)} placeholder="Manchester" style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}} />
              </div>
              <div>
                <label style={{fontWeight: 600, fontSize: "0.875rem", display: "block", marginBottom: "8px"}}>Postcode</label>
                <input type="text" value={garagePostcode} onChange={e => setGaragePostcode(e.target.value.toUpperCase())} placeholder="M1 1AA" style={{width: "100%", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px"}} />
              </div>
            </div>
          </div>
          <button
            onClick={completeGarageDetails}
            disabled={loading || !name || !garageName || !garageAddress || !garageCity || !garagePostcode}
            style={{background: "#0f172a", color: "white", padding: "14px 32px", borderRadius: "10px", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer", width: "100%", marginTop: "24px"}}
          >
            {loading ? "Saving..." : "Create My Garage"}
          </button>
        </div>
      </div>
    )
  }

  return null
}