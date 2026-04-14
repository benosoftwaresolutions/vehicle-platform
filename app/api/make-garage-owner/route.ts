import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Not logged in" })
  }

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { role: "garage_owner", garageId: "cmnyf4oem0004fxeqxe2hrmfn", onboardingStep: 2 },
    create: {
      clerkId: userId,
      email: "beno.softwaresolutions@gmail.com",
      name: "Ben",
      role: "garage_owner",
      onboardingStep: 2,
      garageId: "cmnyf4oem0004fxeqxe2hrmfn"
    }
  })

  return NextResponse.json({ success: true, user })
}