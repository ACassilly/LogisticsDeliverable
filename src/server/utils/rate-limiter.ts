/**
 * In-Memory Rate Limiter
 * 
 * Simple sliding-window rate limiter for API endpoints.
 * Suitable for single-server deployments.
 * 
 * For production at scale, consider upgrading to a Redis-based
 * rate limiter (e.g., @upstash/ratelimit or ioredis + sliding window).
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number
  /** Time window in milliseconds */
  windowMs: number
}

interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean
  /** Number of remaining requests in the current window */
  remaining: number
  /** Milliseconds until the window resets */
  resetIn: number
}

/** Default: 10 requests per 60 seconds */
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000,
}

/** In-memory store for rate limit tracking */
const rateLimitStore = new Map<string, RateLimitEntry>()

/** Interval handle for periodic cleanup */
let cleanupInterval: ReturnType<typeof setInterval> | null = null

/**
 * Start periodic cleanup of expired entries (runs every 5 minutes).
 * Called lazily on first rate limit check.
 */
function ensureCleanup(): void {
  if (cleanupInterval) return

  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 5 * 60 * 1000) // Clean up every 5 minutes

  // Allow the process to exit gracefully (don't keep event loop alive)
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref()
  }
}

/**
 * Check and apply rate limiting for a given identifier (e.g., IP address).
 * 
 * @param identifier - Unique key for rate limiting (typically client IP)
 * @param config - Rate limit configuration (defaults to 10 req/min)
 * @returns RateLimitResult with allowed status, remaining count, and reset time
 * 
 * @example
 * ```ts
 * const ip = getClientIp(request)
 * const result = rateLimit(ip, { maxRequests: 10, windowMs: 60000 })
 * if (!result.allowed) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     { status: 429, headers: { 'Retry-After': String(Math.ceil(result.resetIn / 1000)) } }
 *   )
 * }
 * ```
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): RateLimitResult {
  ensureCleanup()

  const now = Date.now()
  const key = `rl:${identifier}`
  const entry = rateLimitStore.get(key)

  // If no entry or window has expired, create a new window
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    }
  }

  // Increment count within current window
  entry.count += 1

  const remaining = Math.max(0, config.maxRequests - entry.count)
  const resetIn = entry.resetTime - now

  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    }
  }

  return {
    allowed: true,
    remaining,
    resetIn,
  }
}

/**
 * Get the client IP address from a Next.js request.
 * Checks x-forwarded-for, x-real-ip, and falls back to 'unknown'.
 * 
 * @param request - The incoming request object
 * @returns Client IP address string
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs: client, proxy1, proxy2
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

/** Rate limit presets for common use cases */
export const RATE_LIMIT_PRESETS = {
  /** Quote rate endpoint: 10 requests per minute */
  QUOTE_RATE: { maxRequests: 10, windowMs: 60 * 1000 } satisfies RateLimitConfig,
  /** General API: 60 requests per minute */
  GENERAL: { maxRequests: 60, windowMs: 60 * 1000 } satisfies RateLimitConfig,
  /** Strict: 5 requests per minute (for sensitive endpoints) */
  STRICT: { maxRequests: 5, windowMs: 60 * 1000 } satisfies RateLimitConfig,
  /**
   * Checkout: 10 sessions per 2 minutes per IP.
   * More lenient than STRICT because users legitimately retry after
   * cancelling or encountering payment errors.
   */
  CHECKOUT: { maxRequests: 10, windowMs: 2 * 60 * 1000 } satisfies RateLimitConfig,
} as const
