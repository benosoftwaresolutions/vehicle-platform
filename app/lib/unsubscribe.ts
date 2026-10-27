import { createHmac, timingSafeEqual } from "node:crypto"

// ---------------------------------------------------------------------------
// Signed unsubscribe links for MOT/service reminder emails.
//
// The link carries the user's id plus an HMAC signature of it. Without the
// signature, anyone could unsubscribe anyone by guessing ids. The key is
// derived from CRON_SECRET (already set in every environment) with a label,
// so it can't be confused with the cron bearer token itself. Fails closed:
// with no secret, no link verifies.
// ---------------------------------------------------------------------------

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fyca.co.uk").replace(/\/$/, "")

function key(): string | null {
  const secret = process.env.CRON_SECRET
  return secret ? `unsubscribe:v1:${secret}` : null
}

export function unsubscribeToken(userId: string): string | null {
  const k = key()
  if (!k) return null
  return createHmac("sha256", k).update(userId).digest("base64url")
}

export function verifyUnsubscribeToken(userId: string | null | undefined, token: string | null | undefined): boolean {
  if (!userId || !token) return false
  const expected = unsubscribeToken(userId)
  if (!expected) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Page link for the email body (shows a confirmation button). */
export function unsubscribePageUrl(userId: string): string | null {
  const t = unsubscribeToken(userId)
  return t ? `${APP_URL}/unsubscribe?u=${encodeURIComponent(userId)}&t=${t}` : null
}

/** One-click endpoint for the List-Unsubscribe header (RFC 8058, used by Gmail/Yahoo). */
export function unsubscribeOneClickUrl(userId: string): string | null {
  const t = unsubscribeToken(userId)
  return t ? `${APP_URL}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${t}` : null
}
