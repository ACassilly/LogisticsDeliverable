import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError, BadRequestError } from '@/server/middlewares'
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/server/utils/rate-limiter'
import { createOtp } from '@/server/lib/otp-store'
import { sendOtpEmail } from '@/server/services/email.service'

const bodySchema = z.object({ email: z.string().email('Please enter a valid email address.') })

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit(`otp-send:${clientIp}`, RATE_LIMIT_PRESETS.STRICT)
    if (!rateLimitResult.allowed) return NextResponse.json({ success: false, error: 'Too many requests. Please wait before requesting another code.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)) } })
    let body: unknown
    try { body = await request.json() } catch { throw new BadRequestError('Invalid JSON body.') }
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0]?.message ?? 'Invalid request.')
    const { email } = parsed.data
    const { code, cooldownRemaining } = createOtp(email)
    if (cooldownRemaining > 0) return NextResponse.json({ success: false, error: `Please wait ${cooldownRemaining} second${cooldownRemaining === 1 ? '' : 's'} before requesting a new code.`, cooldownRemaining }, { status: 429 })
    const isDev = process.env.NODE_ENV !== 'production'
    const hasCredentials = !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
    if (hasCredentials) { await sendOtpEmail({ to: email, otp: code }) } else if (!isDev) { return NextResponse.json({ success: false, error: 'Email service is not configured.' }, { status: 500 }) }
    return NextResponse.json({ success: true, message: hasCredentials ? `Verification code sent to ${email}` : `[Dev] Email not sent (no SMTP credentials). Use the devCode below.`, ...(isDev && { devCode: code }) })
  } catch (err) { return handleApiError(err) }
}
