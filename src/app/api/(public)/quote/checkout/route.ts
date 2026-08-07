import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, handleApiError } from '@/server/middlewares'
import { checkoutSchema } from '@/server/validations/stripe.validation'
import { createCheckoutSession } from '@/server/services/stripe.service'
import { createBooking } from '@/server/services/booking.service'
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/server/utils/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    // ── Booking gate ──────────────────────────────────────────────
    // Prevent payment collection until the full carrier booking
    // pipeline (carrier shipment booking, BOL generation) is wired.
    // Flip CARRIER_BOOKING_ENABLED=true in Vercel env to activate.
    if (process.env.CARRIER_BOOKING_ENABLED !== 'true') {
      return NextResponse.json(
        { success: false, error: 'Online booking is being activated. Please call (502) 385-3399 to book your shipment.', code: 'BOOKING_DISABLED' },
        { status: 503 }
      )
    }
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit(`checkout:${clientIp}`, RATE_LIMIT_PRESETS.CHECKOUT)
    if (!rateLimitResult.allowed) return NextResponse.json({ success: false, error: 'Too many requests. Please wait before trying again.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)) } })
    const validation = await validateRequest(request, checkoutSchema)
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 })
    const data = validation.data!
    const { sessionId, sessionUrl } = await createCheckoutSession({ carrierName: data.carrierName, totalRate: data.totalRate, charges: data.charges, quoteId: data.quoteId, email: data.email, bookingId: 'pending' })
    const booking = await createBooking({ email: data.email, pickup: data.pickup, delivery: data.delivery, items: data.items, carrierName: data.carrierName, carrierCode: data.carrierCode, quoteId: data.quoteId, totalRate: data.totalRate, charges: data.charges, transitDays: data.transitDays, estimatedDeliveryDate: data.estimatedDeliveryDate, serviceType: data.serviceType, stripeSessionId: sessionId })
    return NextResponse.json({ success: true, data: { sessionUrl, sessionId, bookingId: booking._id?.toString() } }, { status: 200 })
  } catch (error) { return handleApiError(error) }
}
