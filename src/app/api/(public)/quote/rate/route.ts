import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, handleApiError } from '@/server/middlewares'
import { quoteRateRequestSchema, transformToGTZShipRequest } from '@/server/validations/quote.validation'
import { getRates, normalizeRateResponse } from '@/server/services/gtzship.service'
import { createCrmLead } from '@/server/services/odoo.service'
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/server/utils/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit(`quote-rate:${clientIp}`, RATE_LIMIT_PRESETS.QUOTE_RATE)
    if (!rateLimitResult.allowed) return NextResponse.json({ success: false, error: 'Too many requests. Please wait before requesting another quote.', message: 'Rate limit exceeded' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)), 'X-RateLimit-Limit': String(RATE_LIMIT_PRESETS.QUOTE_RATE.maxRequests), 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetIn / 1000)) } })
    const validation = await validateRequest(request, quoteRateRequestSchema)
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 })
    const customerId = process.env.GTZSHIP_CUSTOMER_ID
    if (!customerId) return NextResponse.json({ success: false, error: 'Quote service is not configured. Please contact support.' }, { status: 500 })
    const gtzshipRequest = transformToGTZShipRequest(validation.data!, customerId)
    const gtzshipResponse = await getRates(gtzshipRequest)
    const normalizedData = normalizeRateResponse(gtzshipResponse)
    if (normalizedData.lowestCost) {
      const reqData = validation.data!
      const origin = reqData.origin
      const dest = reqData.destination
      const rateCount = [normalizedData.lowestCost, normalizedData.quickestTransit].filter((r, i, a) => r && (i === 0 || r.quoteId !== a[0]?.quoteId)).length
      createCrmLead({ contactName: reqData.email, email: reqData.email, description: [`Quote Request — ${rateCount} rate(s) returned`, `Route: ${[origin.city, origin.state, origin.zip].filter(Boolean).join(', ')} → ${[dest.city, dest.state, dest.zip].filter(Boolean).join(', ')}`, `Weight: ${reqData.items[0]?.weight ?? '—'} lbs | Class: ${reqData.items[0]?.productClass ?? '—'}`, `Pickup Date: ${reqData.pickupDate}`, normalizedData.lowestCost ? `Lowest Rate: $${normalizedData.lowestCost.rate} (${normalizedData.lowestCost.carrierName})` : ''].filter(Boolean).join('\n') }).catch((err) => { console.error('[Rate] Odoo CRM lead creation failed (non-blocking):', err) })
    }
    return NextResponse.json({ success: true, data: normalizedData, message: normalizedData.lowestCost ? 'Rate quotes retrieved successfully' : 'No rates available for the specified shipment details' }, { status: 200, headers: { 'X-RateLimit-Limit': String(RATE_LIMIT_PRESETS.QUOTE_RATE.maxRequests), 'X-RateLimit-Remaining': String(rateLimitResult.remaining), 'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetIn / 1000)) } })
  } catch (error) { return handleApiError(error) }
}
