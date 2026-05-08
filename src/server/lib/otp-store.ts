const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

interface OtpEntry {
  code: string
  expiresAt: number
  attempts: number
  createdAt: number
}

const store = new Map<string, OtpEntry>()

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

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
  store.set(email, { code, expiresAt: now + OTP_TTL_MS, attempts: 0, createdAt: now })
  return { code, cooldownRemaining: 0 }
}

export function verifyOtp(email: string, code: string): { success: true } | { success: false; reason: string } {
  const entry = store.get(email)
  if (!entry) return { success: false, reason: 'No verification code found. Please request a new one.' }
  if (Date.now() > entry.expiresAt) { store.delete(email); return { success: false, reason: 'Verification code has expired. Please request a new one.' } }
  if (entry.attempts >= MAX_ATTEMPTS) { store.delete(email); return { success: false, reason: 'Too many failed attempts. Please request a new verification code.' } }
  if (entry.code !== code) {
    entry.attempts += 1
    const remaining = MAX_ATTEMPTS - entry.attempts
    return { success: false, reason: remaining > 0 ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` : 'Incorrect code. No attempts remaining — please request a new code.' }
  }
  store.delete(email)
  return { success: true }
}

export function getResendCooldown(email: string): number {
  const entry = store.get(email)
  if (!entry) return 0
  const elapsed = Date.now() - entry.createdAt
  if (elapsed >= RESEND_COOLDOWN_MS) return 0
  return Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000)
}
