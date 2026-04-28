import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ---------------------------------------------------------------------------
// Distributed rate limiter backed by Upstash Redis.
// Falls back to in-memory when env vars are absent (local dev / CI).
// Production: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
// ---------------------------------------------------------------------------

type InMemoryEntry = { count: number; resetAt: number }
const localStore = new Map<string, InMemoryEntry>()

function localRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = localStore.get(key)
  if (!entry || now >= entry.resetAt) {
    localStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}

function makeRedisLimiter(limit: number, windowSeconds: number) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds}s`),
    analytics: false,
  })
}

// Cache limiters by signature so we don't recreate on every request
const limiterCache = new Map<string, Ratelimit>()

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return localRateLimit(key, limit, windowMs)
  }

  const windowSeconds = Math.ceil(windowMs / 1000)
  const sig = `${limit}:${windowSeconds}`
  if (!limiterCache.has(sig)) {
    limiterCache.set(sig, makeRedisLimiter(limit, windowSeconds))
  }
  const limiter = limiterCache.get(sig)!

  const { success } = await limiter.limit(key)
  return success
}
