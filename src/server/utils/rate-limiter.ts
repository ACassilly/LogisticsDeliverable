interface RateLimitEntry { count: number; resetTime: number }
interface RateLimitConfig { maxRequests: number; windowMs: number }
interface RateLimitResult { allowed: boolean; remaining: number; resetIn: number }

const DEFAULT_CONFIG: RateLimitConfig = { maxRequests: 10, windowMs: 60 * 1000 }
const rateLimitStore = new Map<string, RateLimitEntry>()
let cleanupInterval: ReturnType<typeof setInterval> | null = null

function ensureCleanup(): void {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) { if (now > entry.resetTime) rateLimitStore.delete(key) }
  }, 5 * 60 * 1000)
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) (cleanupInterval as NodeJS.Timeout).unref()
}

export function rateLimit(identifier: string, config: RateLimitConfig = DEFAULT_CONFIG): RateLimitResult {
  ensureCleanup()
  const now = Date.now()
  const key = `rl:${identifier}`
  const entry = rateLimitStore.get(key)
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true, remaining: config.maxRequests - 1, resetIn: config.windowMs }
  }
  entry.count += 1
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const resetIn = entry.resetTime - now
  if (entry.count > config.maxRequests) return { allowed: false, remaining: 0, resetIn }
  return { allowed: true, remaining, resetIn }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}

export const RATE_LIMIT_PRESETS = {
  QUOTE_RATE: { maxRequests: 10, windowMs: 60 * 1000 } satisfies RateLimitConfig,
  GENERAL: { maxRequests: 60, windowMs: 60 * 1000 } satisfies RateLimitConfig,
  STRICT: { maxRequests: 5, windowMs: 60 * 1000 } satisfies RateLimitConfig,
  CHECKOUT: { maxRequests: 10, windowMs: 2 * 60 * 1000 } satisfies RateLimitConfig,
} as const
