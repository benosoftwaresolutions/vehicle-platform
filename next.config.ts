import type { NextConfig } from "next";

// Security headers sent with every response.
// Not set here: Strict-Transport-Security — Vercel already sends it for every
// HTTPS domain. And no full Content-Security-Policy yet: Clerk, Stripe and
// Uploadthing load scripts/frames from their own domains, so a strict CSP needs
// careful testing. frame-ancestors is the safe slice of CSP to start with.
const securityHeaders = [
  // Nobody can show fyca.co.uk inside an <iframe> on their site, which stops
  // "clickjacking" (an invisible Fyca page layered under a fake button).
  // X-Frame-Options for older browsers, frame-ancestors for modern ones.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Browsers must trust our Content-Type and never "guess" that an upload is
  // HTML or JavaScript and run it.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites see only "fyca.co.uk" as the referrer, never full URLs
  // (which can include booking IDs).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Switch off powerful browser features Fyca doesn't use, so injected or
  // third-party code can't use them either.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
]

const nextConfig: NextConfig = {
  // Don't advertise "X-Powered-By: Next.js" — tells attackers which exploits to try
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",        // Uploadthing
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",       // Uploadthing (newer CDN)
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",  // Clerk avatars
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev", // Clerk avatars (legacy)
      },
    ],
  },
};

export default nextConfig;
