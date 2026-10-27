import { NextResponse } from "next/server"
import { prisma } from "@/app/lib/prisma"
import { verifyUnsubscribeToken } from "@/app/lib/unsubscribe"

// One-click unsubscribe (RFC 8058). Mail providers POST here when someone
// presses "Unsubscribe" next to the sender name. POST only: link scanners
// that pre-fetch URLs with GET can't unsubscribe people by accident.
export async function POST(req: Request) {
  const url = new URL(req.url)
  const userId = url.searchParams.get("u")
  if (!verifyUnsubscribeToken(userId, url.searchParams.get("t"))) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 })
  }
  await prisma.user.updateMany({ where: { id: userId! }, data: { reminderEmails: false } })
  return NextResponse.json({ ok: true })
}
