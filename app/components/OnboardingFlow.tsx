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
  returnTo?: string
}

export default function OnboardingFlow({ user, returnTo }: OnboardingFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(user.onboardingStep)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name || "")
  const [garageName, setGarageName] = useState("")
  const [garageAddress, setGarageAddress] = useState("")
  const [garageCity, setGarageCity] = useState("")
  const [garagePostcode, setGaragePostcode] = useState("")
  const [garageEmail, setGarageEmail] = useState("")
  const [garagePhone, setGaragePhone] = useState("")
  const [selectedRole, setSelectedRole] = useState<string | null>(
    user.role !== "pending" ? user.role : null
  )
  const [createdGarageId, setCreatedGarageId] = useState<string | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)

  // Driver vehicle step
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleYear, setVehicleYear] = useState("")
  const [vehicleReg, setVehicleReg] = useState("")
  const [vehicleSaving, setVehicleSaving] = useState(false)

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
    setStep(3)
  }

  const addFirstVehicle = async () => {
    setVehicleSaving(true)
    await fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ make: vehicleMake, model: vehicleModel, year: vehicleYear, registration: vehicleReg }),
    })
    setVehicleSaving(false)
    router.push(returnTo ?? "/")
  }

  const completeGarageDetails = async () => {
    setLoading(true)
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 2, role: "garage_owner", name, garageName, garageAddress, garageCity, garagePostcode, garageEmail, garagePhone })
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

  // Step 0/1 — Choose role
  if (step === 0 || step === 1) {
    return (
      <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
        <div style={{ maxWidth: "560px", width: "100%" }}>
          <div style={{ marginBottom: "48px" }}>
            <DryvnMark />
            <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "clamp(28px,4vw,40px)", letterSpacing: "-0.03em", color: "#111110", marginBottom: "10px", marginTop: "32px" }}>
              Welcome to Fyca
            </h1>
            <p style={{ color: "#6b6a66", fontSize: "1rem" }}>How will you be using the platform?</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <button
              onClick={() => chooseRole("customer")}
              disabled={loading}
              style={{ background: "#f4f3ef", border: "0.5px solid rgba(0,0,0,0.10)", borderRadius: 14, padding: "28px 20px", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#eceae4")}
              onMouseLeave={e => (e.currentTarget.style.background = "#f4f3ef")}
            >
              <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", color: "#111110", marginBottom: "6px" }}>I need a garage</p>
              <p style={{ color: "#6b6a66", fontSize: "0.85rem", lineHeight: 1.5 }}>Find and book garages for your vehicle</p>
            </button>
            <button
              onClick={() => chooseRole("garage_owner")}
              disabled={loading}
              style={{ background: "#f4f3ef", border: "0.5px solid rgba(0,0,0,0.10)", borderRadius: 14, padding: "28px 20px", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#eceae4")}
              onMouseLeave={e => (e.currentTarget.style.background = "#f4f3ef")}
            >
              <p style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.1rem", color: "#111110", marginBottom: "6px" }}>I own a garage</p>
              <p style={{ color: "#6b6a66", fontSize: "0.85rem", lineHeight: 1.5 }}>List your garage and manage bookings</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2 — Customer profile
  if (step === 2 && selectedRole === "customer") {
    return (
      <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
        <div style={{ maxWidth: "440px", width: "100%" }}>
          <DryvnMark />
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.75rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px", marginTop: "28px" }}>
            Your Profile
          </h1>
          <p style={{ color: "#6b6a66", marginBottom: "28px" }}>Just a few details to get started</p>
          <div style={{ marginBottom: "20px" }}>
            <label style={lbl}>Full Name</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              style={inp}
            />
          </div>
          <button
            onClick={completeCustomer}
            disabled={loading || !name}
            style={{ background: loading || !name ? "#eceae4" : "#111110", color: loading || !name ? "#6b6a66" : "#ffffff", padding: "14px", borderRadius: 100, fontWeight: 600, fontSize: "1rem", border: "none", cursor: loading || !name ? "not-allowed" : "pointer", width: "100%" }}
          >
            {loading ? "Saving…" : "Get Started"}
          </button>
        </div>
      </div>
    )
  }

  // Step 2 — Garage owner details
  if (step === 2 && selectedRole === "garage_owner") {
    const canSubmit = !loading && name && garageName && garageAddress && garageCity && garagePostcode && garageEmail && garagePhone
    return (
      <div style={{ minHeight: "100vh", background: "#ffffff", padding: "48px 24px" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>

          <DryvnMark />

          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "28px 0 32px" }}>
            <Step label="Account type" state="done" />
            <div style={{ flex: 1, height: "0.5px", background: "#d1d0cb" }} />
            <Step label="Garage details" state="active" />
            <div style={{ flex: 1, height: "0.5px", background: "#d1d0cb" }} />
            <Step label="Logo" state="upcoming" />
          </div>

          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.75rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "6px" }}>
            Set up your garage
          </h1>
          <p style={{ color: "#6b6a66", marginBottom: "28px" }}>This takes about 2 minutes. You can update everything later.</p>

          {/* Owner name */}
          <div style={card}>
            <p style={cardTitle}>Your details</p>
            <label style={lbl}>Your full name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ben Smith" style={inp} />
          </div>

          {/* Garage identity */}
          <div style={{ ...card, marginTop: "14px" }}>
            <p style={cardTitle}>Garage identity</p>
            <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginBottom: "14px" }}>This appears on your public listing</p>
            <label style={lbl}>Garage name</label>
            <input type="text" value={garageName} onChange={e => setGarageName(e.target.value)} placeholder="e.g. City Auto Centre" style={inp} />
          </div>

          {/* Location */}
          <div style={{ ...card, marginTop: "14px", marginBottom: "28px" }}>
            <p style={cardTitle}>Location</p>
            <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginBottom: "14px" }}>Where customers will find you</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={lbl}>Street address</label>
                <input type="text" value={garageAddress} onChange={e => setGarageAddress(e.target.value)} placeholder="e.g. 42 Industrial Way" style={inp} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={lbl}>City / Town</label>
                  <input type="text" value={garageCity} onChange={e => setGarageCity(e.target.value)} placeholder="e.g. Manchester" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Postcode</label>
                  <input type="text" value={garagePostcode} onChange={e => setGaragePostcode(e.target.value.toUpperCase())} placeholder="e.g. M1 1AA" style={inp} />
                </div>
              </div>
            </div>
          </div>

          {/* Contact — shown publicly and used to reach the garage */}
          <div style={{ ...card, marginTop: "14px", marginBottom: "28px" }}>
            <p style={cardTitle}>Contact details</p>
            <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginBottom: "14px" }}>How customers and Fyca get hold of you</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={lbl}>Garage email</label>
                <input type="email" value={garageEmail} onChange={e => setGarageEmail(e.target.value)} placeholder="e.g. bookings@cityauto.co.uk" style={inp} />
                <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginTop: "6px", lineHeight: 1.45 }}>
                  New booking notifications are sent here. Not shown on your public page — use the inbox you actually check.
                </p>
              </div>
              <div>
                <label style={lbl}>Phone number</label>
                <input type="tel" value={garagePhone} onChange={e => setGaragePhone(e.target.value)} placeholder="e.g. 0161 123 4567" style={inp} />
                <p style={{ fontSize: "0.78rem", color: "#6b6a66", marginTop: "6px", lineHeight: 1.45 }}>
                  Shown on your public page so customers can call you.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={completeGarageDetails}
            disabled={!canSubmit}
            style={{ background: canSubmit ? "#111110" : "#eceae4", color: canSubmit ? "#ffffff" : "#6b6a66", padding: "15px 32px", borderRadius: 100, fontWeight: 600, fontSize: "1rem", border: "none", cursor: canSubmit ? "pointer" : "not-allowed", width: "100%" }}
          >
            {loading ? "Creating your garage…" : "Continue →"}
          </button>
          <p style={{ textAlign: "center", color: "#6b6a66", fontSize: "0.8rem", marginTop: "12px" }}>
            You can add services, photos and more after setup
          </p>
        </div>
      </div>
    )
  }

  // Step 3 — Driver: add first vehicle
  if (step === 3 && selectedRole === "customer") {
    const canAddVehicle = vehicleMake && vehicleModel && vehicleYear && vehicleReg
    return (
      <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
        <div style={{ maxWidth: "480px", width: "100%" }}>
          <DryvnMark />
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.75rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "8px", marginTop: "28px" }}>
            Add your first vehicle
          </h1>
          <p style={{ color: "#6b6a66", marginBottom: "28px", lineHeight: 1.6 }}>
            Track MOT dates, service history, and get reminded before things are due. Skip and add later if you prefer.
          </p>

          <div style={{ background: "#f4f3ef", borderRadius: 14, padding: "22px", display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Make</label>
                <input type="text" value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} placeholder="e.g. Ford" style={inp} />
              </div>
              <div>
                <label style={lbl}>Model</label>
                <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="e.g. Focus" style={inp} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Year</label>
                <input type="text" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} placeholder="e.g. 2019" style={inp} />
              </div>
              <div>
                <label style={lbl}>Registration</label>
                <input type="text" value={vehicleReg} onChange={e => setVehicleReg(e.target.value.toUpperCase())} placeholder="e.g. AB19 XYZ" style={inp} />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={addFirstVehicle}
              disabled={!canAddVehicle || vehicleSaving}
              style={{ background: canAddVehicle && !vehicleSaving ? "#111110" : "#eceae4", color: canAddVehicle && !vehicleSaving ? "#ffffff" : "#6b6a66", padding: "14px", borderRadius: 100, fontWeight: 600, fontSize: "1rem", border: "none", cursor: canAddVehicle && !vehicleSaving ? "pointer" : "not-allowed", width: "100%" }}
            >
              {vehicleSaving ? "Saving…" : "Add vehicle & continue"}
            </button>
            <button
              onClick={() => router.push(returnTo ?? "/")}
              style={{ background: "none", color: "#6b6a66", padding: "10px", border: "none", cursor: "pointer", fontSize: "0.875rem" }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3 — Logo upload + billing setup
  if (step === 3 && selectedRole === "garage_owner") {
    const startBilling = async () => {
      setBillingLoading(true)
      try {
        const res = await fetch("/api/subscriptions/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: "garage_pro" }),
        })
        const data = await res.json()
        if (data.url) window.location.href = data.url
      } finally {
        setBillingLoading(false)
      }
    }

    return (
      <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px" }}>
        <div style={{ maxWidth: "440px", width: "100%" }}>
          <DryvnMark />
          <h1 style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 600, fontSize: "1.75rem", letterSpacing: "-0.03em", color: "#111110", marginBottom: "8px", marginTop: "28px" }}>
            Garage created!
          </h1>
          <p style={{ color: "#6b6a66", marginBottom: "28px", lineHeight: 1.6 }}>
            Add a logo to help customers recognise your garage. You can always update this in Settings.
          </p>
          <LogoUploader currentLogoUrl={null} />
          <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={startBilling}
              disabled={billingLoading}
              style={{ background: billingLoading ? "#eceae4" : "#111110", color: billingLoading ? "#6b6a66" : "#ffffff", padding: "14px", borderRadius: 100, fontWeight: 600, fontSize: "1rem", border: "none", cursor: billingLoading ? "not-allowed" : "pointer", width: "100%" }}
            >
              {billingLoading ? "Redirecting…" : "Set up billing →"}
            </button>
            <p style={{ textAlign: "center", fontSize: "0.78rem", color: "#6b6a66", margin: 0 }}>
              No charge during your 30-day trial. Card required to continue after.
            </p>
            <button
              onClick={() => router.push("/garage-dashboard")}
              style={{ background: "none", color: "#6b6a66", padding: "10px", border: "none", cursor: "pointer", fontSize: "0.875rem" }}
            >
              I&apos;ll set up billing later
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function DryvnMark() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ width: 28, height: 28, background: "#111110", borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ color: "#ffffff", fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 700, fontSize: 15, lineHeight: 1, letterSpacing: "-0.04em" }}>F</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 700, fontSize: "1rem", color: "#111110", letterSpacing: "-0.04em", lineHeight: 1 }}>Fyca</span>
        <span style={{ fontSize: 8, fontWeight: 500, letterSpacing: "0.13em", textTransform: "uppercase" as const, color: "#aaa9a4", lineHeight: 1 }}>Fix Your Car Anywhere</span>
      </div>
    </div>
  )
}

function Step({ label, state }: { label: string; state: "done" | "active" | "upcoming" }) {
  const bg = state === "done" ? "#111110" : state === "active" ? "#111110" : "#eceae4"
  const textColor = state === "upcoming" ? "#6b6a66" : "#111110"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {state === "done"
          ? <span style={{ color: "#ffffff", fontSize: "0.65rem", fontWeight: 700 }}>✓</span>
          : <span style={{ color: state === "active" ? "#ffffff" : "#6b6a66", fontSize: "0.65rem", fontWeight: 700 }}>
              {state === "active" ? "2" : "3"}
            </span>
        }
      </div>
      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: textColor }}>{label}</span>
    </div>
  )
}

const card: React.CSSProperties = { background: "#f4f3ef", borderRadius: 14, padding: "20px 22px" }
const cardTitle: React.CSSProperties = { fontWeight: 700, fontSize: "0.875rem", color: "#111110", marginBottom: "14px" }
const lbl: React.CSSProperties = { fontWeight: 600, fontSize: "0.85rem", color: "#444441", display: "block", marginBottom: "6px" }
const inp: React.CSSProperties = { width: "100%", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: 8, padding: "11px 14px", fontSize: "0.95rem", boxSizing: "border-box", outline: "none", background: "#ffffff", color: "#111110" }
