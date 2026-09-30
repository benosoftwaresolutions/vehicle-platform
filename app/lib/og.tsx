import { readFile } from "node:fs/promises"
import { join } from "node:path"

// Shared building blocks for the opengraph-image.tsx routes.
//
// These images are rendered by Satori (via next/og), which is NOT a browser:
// it supports a subset of CSS, every element with more than one child needs
// display: "flex", and fonts must be static TTF/OTF files passed in explicitly
// (it can't use next/font or variable fonts). That's why static instances of
// Fraunces and DM Sans live in /assets/fonts.

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

const C = {
  bg: "#ffffff",
  surface: "#f4f3ef",
  text: "#111110",
  secondary: "#444441",
  muted: "#6b6a66",
  border: "rgba(0,0,0,0.10)",
}

// Paths are written out in full (not built from a variable) so Vercel's file
// tracing can see them and ship the font files with the serverless function.
export async function loadOgFonts() {
  const [fraunces, dmSans] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Fraunces-SemiBold.ttf")),
    readFile(join(process.cwd(), "assets/fonts/DMSans-Medium.ttf")),
  ])
  return [
    { name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const },
    { name: "DM Sans", data: dmSans, weight: 500 as const, style: "normal" as const },
  ]
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div
        style={{
          width: 64, height: 64, borderRadius: 22, background: C.text,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontFamily: "Fraunces", fontSize: 38, letterSpacing: "-0.04em",
        }}
      >
        F
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontFamily: "Fraunces", fontSize: 36, color: C.text, letterSpacing: "-0.04em", lineHeight: 1 }}>
          Fyca
        </div>
        <div style={{ fontSize: 14, color: C.muted, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Fix Your Car Anywhere
        </div>
      </div>
    </div>
  )
}

function Frame({ children, footer }: { children: React.ReactNode; footer: string }) {
  return (
    <div
      style={{
        width: "100%", height: "100%", background: C.bg, display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: "64px 72px", fontFamily: "DM Sans", color: C.text,
      }}
    >
      <Brand />
      {children}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: `1px solid ${C.border}`, paddingTop: 28, fontSize: 24, color: C.muted,
        }}
      >
        <div style={{ display: "flex" }}>{footer}</div>
        <div style={{ display: "flex", color: C.text }}>fyca.co.uk</div>
      </div>
    </div>
  )
}

/** Default card for every page that doesn't have its own. */
export function SiteOgCard() {
  return (
    <Frame footer="Online booking for independent UK garages">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 20, color: C.secondary, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          The smarter way to book
        </div>
        <div
          style={{
            fontFamily: "Fraunces", fontSize: 76, lineHeight: 1.06, letterSpacing: "-0.03em", maxWidth: 900,
          }}
        >
          Book a trusted local garage in seconds.
        </div>
      </div>
    </Frame>
  )
}

export type GarageOgData = {
  name: string
  city: string
  postcode: string
  services: string[]
  specialistMakes: string[]
  rating: number
  reviewCount: number
  /** A data: URL (PNG/JPEG) — fetched and validated by the caller, never a remote URL. */
  logoDataUrl: string | null
}

/** Card shown when a garage's booking link is shared (WhatsApp, iMessage, Facebook…). */
export function GarageOgCard({ g }: { g: GarageOgData }) {
  const chips = [...g.specialistMakes.map((m) => `${m} specialist`), ...g.services].slice(0, 3)
  const nameSize = g.name.length > 34 ? 56 : g.name.length > 22 ? 66 : 76

  return (
    <Frame footer="Book online — no phone calls needed">
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        {g.logoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>, not next/image
          <img
            src={g.logoDataUrl}
            width={148}
            height={148}
            alt=""
            style={{ borderRadius: 28, objectFit: "cover", border: `1px solid ${C.border}` }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
          <div
            style={{
              fontFamily: "Fraunces", fontSize: nameSize, lineHeight: 1.05, letterSpacing: "-0.03em",
              display: "flex",
            }}
          >
            {g.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 28, color: C.secondary }}>
            <div style={{ display: "flex" }}>{`${g.city} · ${g.postcode}`}</div>
            {g.reviewCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text }}>
                {/* SVG rather than the ★ character: DM Sans has no star glyph, and Satori can't fall back to a system font */}
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <path fill={C.text} d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95z" />
                </svg>
                {`${g.rating.toFixed(1)} (${g.reviewCount} review${g.reviewCount === 1 ? "" : "s"})`}
              </div>
            )}
          </div>
          {chips.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              {chips.map((c) => (
                <div
                  key={c}
                  style={{
                    display: "flex", background: C.surface, borderRadius: 100,
                    padding: "10px 22px", fontSize: 22, color: C.text,
                  }}
                >
                  {c}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Frame>
  )
}
