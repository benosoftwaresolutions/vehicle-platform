"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LogoUploader from "./LogoUploader"

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
  const [createdGarageId, setCreatedGarageId] = useState<string | null>(null)

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
    const res = await fetch("/api/onboarding", {
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
    const data = await res.json()
    setLoading(false)
    if (data.garageId) {
      setCreatedGarageId(data.garageId)
      setStep(3)
    } else {
      router.push("/garage-dashboard")
    }
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
    const canSubmit = !loading && name && garageName && garageAddress && garageCity && garagePostcode
    return (
      <div style={{minHeight: "100vh", background: "#f8f9fb", padding: "48px 24px"}}>
        <div style={{maxWidth: "600px", margin: "0 auto"}}>

          {/* Header */}
          <div style={{marginBottom: "32px"}}>
            <div style={{display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px"}}>
              <div style={{width: 40, height: 40, background: "#0f172a", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <span style={{fontSize: "1.25rem"}}>🔧</span>
              </div>
              <span style={{fontWeight: 800, fontSize: "1.1rem", color: "#0f172a"}}>VehiclePlatform</span>
            </div>
            <h1 style={{fontSize: "2rem", fontWeight: 800, color: "#0f172a", marginBottom: "6px"}}>Set up your garage</h1>
            <p style={{color: "#64748b", fontSize: "1rem"}}>This takes about 2 minutes. You can update everything later.</p>
          </div>

          {/* Progress indicator */}
          <div style={{display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px"}}>
            <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
              <div style={{width: 24, height: 24, borderRadius: "50%", background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <span style={{color: "white", fontSize: "0.7rem", fontWeight: 700}}>✓</span>
              </div>
              <span style={{fontSize: "0.8rem", fontWeight: 600, color: "#16a34a"}}>Account type</span>
            </div>
            <div style={{flex: 1, height: 2, background: "#e5e7eb", borderRadius: 1}} />
            <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
              <div style={{width: 24, height: 24, borderRadius: "50%", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <span style={{color: "white", fontSize: "0.75rem", fontWeight: 700}}>2</span>
              </div>
              <span style={{fontSize: "0.8rem", fontWeight: 600, color: "#0f172a"}}>Garage details</span>
            </div>
            <div style={{flex: 1, height: 2, background: "#e5e7eb", borderRadius: 1}} />
            <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
              <div style={{width: 24, height: 24, borderRadius: "50%", background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <span style={{color: "#94a3b8", fontSize: "0.75rem", fontWeight: 700}}>3</span>
              </div>
              <span style={{fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8"}}>Logo</span>
            </div>
          </div>

          {/* Owner name */}
          <div style={{background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", marginBottom: "16px"}}>
            <div style={{padding: "14px 20px", background: "#f8f9fb", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "10px"}}>
              <span>👤</span>
              <p style={{fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0}}>Your details</p>
            </div>
            <div style={{padding: "20px"}}>
              <label style={onboardingLabelStyle}>Your full name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Ben Smith"
                style={onboardingInputStyle}
              />
            </div>
          </div>

          {/* Garage identity */}
          <div style={{background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", marginBottom: "16px"}}>
            <div style={{padding: "14px 20px", background: "#f8f9fb", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "10px"}}>
              <span>🏢</span>
              <div>
                <p style={{fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0}}>Garage identity</p>
                <p style={{fontSize: "0.78rem", color: "#64748b", margin: 0}}>This appears on your public listing</p>
              </div>
            </div>
            <div style={{padding: "20px"}}>
              <label style={onboardingLabelStyle}>Garage name</label>
              <input
                type="text" value={garageName} onChange={e => setGarageName(e.target.value)}
                placeholder="e.g. City Auto Centre"
                style={onboardingInputStyle}
              />
            </div>
          </div>

          {/* Location */}
          <div style={{background: "white", border: "1px solid #e5e7eb", borderRadius: "14px", overflow: "hidden", marginBottom: "28px"}}>
            <div style={{padding: "14px 20px", background: "#f8f9fb", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "10px"}}>
              <span>📍</span>
              <div>
                <p style={{fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", margin: 0}}>Location</p>
                <p style={{fontSize: "0.78rem", color: "#64748b", margin: 0}}>Where customers will find you</p>
              </div>
            </div>
            <div style={{padding: "20px", display: "flex", flexDirection: "column", gap: "16px"}}>
              <div>
                <label style={onboardingLabelStyle}>Street address</label>
                <input
                  type="text" value={garageAddress} onChange={e => setGarageAddress(e.target.value)}
                  placeholder="e.g. 42 Industrial Way"
                  style={onboardingInputStyle}
                />
              </div>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
                <div>
                  <label style={onboardingLabelStyle}>City / Town</label>
                  <input
                    type="text" value={garageCity} onChange={e => setGarageCity(e.target.value)}
                    placeholder="e.g. Manchester"
                    style={onboardingInputStyle}
                  />
                </div>
                <div>
                  <label style={onboardingLabelStyle}>Postcode</label>
                  <input
                    type="text" value={garagePostcode} onChange={e => setGaragePostcode(e.target.value.toUpperCase())}
                    placeholder="e.g. M1 1AA"
                    style={onboardingInputStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={completeGarageDetails}
            disabled={!canSubmit}
            style={{
              background: canSubmit ? "#0f172a" : "#94a3b8",
              color: "white", padding: "16px 32px", borderRadius: "12px",
              fontWeight: 700, fontSize: "1rem", border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed", width: "100%",
              boxShadow: canSubmit ? "0 4px 16px rgba(15,23,42,0.25)" : "none",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Creating your garage..." : "Continue →"}
          </button>
          <p style={{textAlign: "center", color: "#94a3b8", fontSize: "0.8rem", marginTop: "12px"}}>
            You can add services, photos and more after setup
          </p>
        </div>
      </div>
    )
  }

  // Step 3 — Logo upload (garage owners only, optional)
  if (step === 3 && selectedRole === "garage_owner") {
    return (
      <div style={{minHeight: "100vh", background: "#f8f9fb", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px"}}>
        <div style={{maxWidth: "480px", width: "100%", background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"}}>
          <div style={{textAlign: "center", marginBottom: "32px"}}>
            <p style={{fontSize: "3rem", marginBottom: "12px"}}>🎉</p>
            <h1 style={{fontSize: "1.75rem", fontWeight: 800, marginBottom: "8px"}}>Garage Created!</h1>
            <p style={{color: "#64748b"}}>Add a logo to help customers recognise your garage. You can always do this later in Settings.</p>
          </div>
          <LogoUploader currentLogoUrl={null} />
          <div style={{marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px"}}>
            <button
              onClick={() => router.push("/garage-dashboard")}
              style={{background: "#0f172a", color: "white", padding: "14px 32px", borderRadius: "10px", fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer", width: "100%"}}
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push("/garage-dashboard")}
              style={{background: "none", color: "#64748b", padding: "10px", border: "none", cursor: "pointer", fontSize: "0.875rem"}}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

const onboardingInputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "11px 14px",
  fontSize: "0.95rem",
  boxSizing: "border-box",
  outline: "none",
}

const onboardingLabelStyle: React.CSSProperties = {
  fontWeight: 600,
  fontSize: "0.875rem",
  display: "block",
  marginBottom: "6px",
  color: "#374151",
}