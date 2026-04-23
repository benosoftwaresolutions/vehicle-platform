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
    ],
  },
};

export default nextConfig;
