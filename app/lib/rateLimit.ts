/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Works per serverless instance. For distributed rate limiting at scale,
 * replace with Vercel KV / Upstash Redis.
 */

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

/**
 * Returns true if the request is allowed, false if the limit is exceeded.
 * @param key     Unique key (e.g. IP + route)
 * @param limit   Max requests per window
 * @param windowMs Window duration in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
