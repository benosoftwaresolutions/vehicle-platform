import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
