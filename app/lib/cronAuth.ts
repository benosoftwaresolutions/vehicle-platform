import { timingSafeEqual } from "node:crypto"

/**
 * Checks a cron request carries Vercel's `Authorization: Bearer <CRON_SECRET>`.
 *
 * Fails CLOSED: if CRON_SECRET isn't configured, every request is rejected.
 * The old inline check compared against `Bearer ${process.env.CRON_SECRET}`,
 * which becomes the literal string "Bearer undefined" when the variable is
 * missing — so anyone sending that header would have been let in.
 *
 * timingSafeEqual compares in constant time, so response timing can't be used
 * to guess the secret one character at a time.
 */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error("[cron] CRON_SECRET is not set — rejecting request")
    return false
  }

  const header = req.headers.get("authorization") ?? ""
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(header)
  // timingSafeEqual throws if lengths differ, so check that first
  return received.length === expected.length && timingSafeEqual(received, expected)
}
