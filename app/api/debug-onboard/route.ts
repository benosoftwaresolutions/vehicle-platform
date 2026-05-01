import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

export async function GET() {
  const r: Record<string, string> = {}
  try {
    const { userId } = await auth()
    r.userId = userId ? userId.slice(0, 12) : "null"
    if (!userId) return NextResponse.json(r)

    const byClerkId = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, email: true, role: true, onboardingStep: true } }).catch(e => ({ error: String(e) }))
    r.byClerkId = JSON.stringify(byClerkId)

    const cu = await currentUser().catch(() => null)
    const email = cu?.emailAddresses?.[0]?.emailAddress ?? ""
    r.clerkEmail = email

    if (email) {
      const byEmail = await prisma.user.findUnique({ where: { email }, select: { id: true, clerkId: true, role: true, onboardingStep: true } }).catch(e => ({ error: String(e) }))
      r.byEmail = JSON.stringify(byEmail)
    }
  } catch (e) { r.error = String(e) }
  return NextResponse.json(r)
}
