"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
  const [uploadError, setUploadError] = useState<string | null>(null)

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      {/* Preview */}
      <div style={{
        width: 80, height: 80, borderRadius: 12,
        border: "0.5px solid rgba(0,0,0,0.10)", background: "#f4f3ef",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", flexShrink: 0,
      }}>
        {logoUrl
          ? <Image src={logoUrl} alt="Garage logo" fill sizes="80px" style={{ objectFit: "cover" }} />
          : <div style={{ width: 32, height: 32, background: "#111110", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
                <path d="M11 17V5M11 5L5 11M11 5L17 11" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
        }
      </div>

      <div>
        <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#111110", marginBottom: "4px" }}>Garage Logo</p>
        <p style={{ color: "#6b6a66", fontSize: "0.8rem", marginBottom: "10px" }}>PNG or JPG, up to 2MB</p>
        <UploadButton
          endpoint="garageLogoUploader"
          onClientUploadComplete={(res) => {
            setUploadError(null)
            const url = res?.[0]?.serverData?.logoUrl ?? res?.[0]?.url
            if (url) {
              setLogoUrl(url)
              onLogoChange?.(url)
            }
            router.refresh()
          }}
          onUploadError={(error: Error) => {
            setUploadError(error.message)
          }}
          appearance={{
            button: {
              background: "#111110",
              color: "white",
              padding: "8px 18px",
              borderRadius: "100px",
              fontWeight: "600",
              fontSize: "0.875rem",
            },
            allowedContent: { display: "none" },
          }}
        />
        {uploadError && (
          <p style={{ color: "#dc2626", fontSize: "0.78rem", marginTop: 8 }}>
            Upload failed: {uploadError}
          </p>
        )}
      </div>
    </div>
  )
}
