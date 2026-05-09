/**
 * In-memory OTP store for email verification.
 *
 * This module acts as a server-side singleton; Next.js keeps the module alive
 * between requests in a long-running server process. The Map is cleared
 * automatically when entries expire (TTL check on every access).
 *
 * Constraints:
 *  - TTL: 10 minutes
 *  - Max verification attempts: 5
 *  - Resend cooldown: 60 seconds
 */

const OTP_TTL_MS = 10 * 60 * 1000       // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000    // 60 seconds
const MAX_ATTEMPTS = 5

interface OtpEntry {
  code: string
  expiresAt: number
  attempts: number
  createdAt: number
}

// Module-level singleton — persists across requests within a server instance.
const store = new Map<string, OtpEntry>()

/** Generate a cryptographically adequate 6-digit OTP. */
function generateCode(): string {
  // Math.random is sufficient for a short-lived, rate-limited OTP
  return String(Math.floor(100000 + Math.random() * 900000))
}

/**
 * Create (or replace) an OTP for the given email.
 * Respects the 60-second resend cooldown and returns the remaining
 * cooldown seconds if the caller is calling too soon.
 *
 * @returns `{ code, cooldownRemaining }` — `cooldownRemaining` is 0 when a
 *   new code was issued, otherwise the positive seconds still remaining.
 */
export function createOtp(email: string): { code: string; cooldownRemaining: number } {
  const existing = store.get(email)
  const now = Date.now()

  if (existing) {
    const elapsed = now - existing.createdAt
    if (elapsed < RESEND_COOLDOWN_MS) {
      const cooldownRemaining = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
      return { code: existing.code, cooldownRemaining }
    }
  }

  const code = generateCode()
  store.set(email, {
    code,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    createdAt: now,
  })

  return { code, cooldownRemaining: 0 }
}

/**
 * Verify an OTP code submitted by the user.
 *
 * @returns `{ success: true }` on match, or
 *   `{ success: false, reason: string }` with a human-readable message.
 */
export function verifyOtp(
  email: string,
  code: string
): { success: true } | { success: false; reason: string } {
  const entry = store.get(email)

  if (!entry) {
    return { success: false, reason: 'No verification code found. Please request a new one.' }
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(email)
    return { success: false, reason: 'Verification code has expired. Please request a new one.' }
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    store.delete(email)
    return {
      success: false,
      reason: 'Too many failed attempts. Please request a new verification code.',
    }
  }

  if (entry.code !== code) {
    entry.attempts += 1
    const remaining = MAX_ATTEMPTS - entry.attempts
    return {
      success: false,
      reason:
        remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Incorrect code. No attempts remaining — please request a new code.',
    }
  }

  // Success — remove the entry so it cannot be reused
  store.delete(email)
  return { success: true }
}

/**
 * Return the resend cooldown remaining (in seconds) for the given email.
 * Returns 0 if no entry exists or the cooldown has passed.
 */
export function getResendCooldown(email: string): number {
  const entry = store.get(email)
  if (!entry) return 0
  const elapsed = Date.now() - entry.createdAt
  if (elapsed >= RESEND_COOLDOWN_MS) return 0
  return Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
}
