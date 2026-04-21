"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadButton } from "@/app/lib/uploadthing"

export default function LogoUploader({
  currentLogoUrl,
  onLogoChange,
}: {
  currentLogoUrl?: string | null
  onLogoChange?: (url: string) => void
}) {
  const router = useRouter()
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl ?? null)

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      {/* Preview */}
      <div style={{
        width: 80, height: 80, borderRadius: "12px",
        border: "1px solid #e5e7eb", background: "#f8f9fb",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", flexShrink: 0,
      }}>
        {logoUrl
          ? <img src={logoUrl} alt="Garage logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontSize: "2rem" }}>🔧</span>
        }
      </div>

      <div>
        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#374151", marginBottom: "4px" }}>Garage Logo</p>
        <p style={{ color: "#64748b", fontSize: "0.8rem", marginBottom: "10px" }}>PNG or JPG, up to 2MB</p>
        <UploadButton
          endpoint="garageLogoUploader"
          onClientUploadComplete={(res) => {
            const url = res?.[0]?.serverData?.logoUrl ?? res?.[0]?.url
            if (url) {
              setLogoUrl(url)
              onLogoChange?.(url)
            }
            router.refresh()
          }}
          onUploadError={(error: Error) => {
            console.error("Logo upload error:", error)
            alert(`Upload failed: ${error.message}`)
          }}
          appearance={{
            button: {
              background: "#0f172a",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "0.875rem",
            },
            allowedContent: { display: "none" },
          }}
        />
      </div>
    </div>
  )
}
