import { NextResponse } from "next/server"
import packageJson from "@/package.json"

export async function GET() {
  return NextResponse.json({
    status: "ok",
    env: process.env.NEXT_PUBLIC_ENV ?? "unknown",
    timestamp: new Date().toISOString(),
    version: packageJson.version,
  })
}
