import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError, BadRequestError } from '@/server/middlewares'
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/server/utils/rate-limiter'
import { verifyOtp } from '@/server/lib/otp-store'

const bodySchema = z.object({ email: z.string().email('Please enter a valid email address.'), code: z.string().length(6, 'Code must be exactly 6 digits.').regex(/^\d{6}$/, 'Code must contain only digits.') })

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit(`otp-verify:${clientIp}`, RATE_LIMIT_PRESETS.STRICT)
    if (!rateLimitResult.allowed) return NextResponse.json({ success: false, error: 'Too many verification attempts. Please wait before trying again.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)) } })
    let body: unknown
    try { body = await request.json() } catch { throw new BadRequestError('Invalid JSON body.') }
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) throw new BadRequestError(parsed.error.issues[0]?.message ?? 'Invalid request.')
    const { email, code } = parsed.data
    const result = verifyOtp(email, code)
    if (!result.success) return NextResponse.json({ success: false, error: result.reason }, { status: 400 })
    return NextResponse.json({ success: true, message: 'Email verified successfully.' })
  } catch (err) { return handleApiError(err) }
}
