import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, handleApiError } from '@/server/middlewares'
import { quoteRateRequestSchema } from '@/server/validations/quote.validation'
import { getCarrierProvider, type NormalizedRateResponse } from '@/server/services/carriers'
import { attachPesFleetOverflowOption } from '@/server/services/pes-fleet-overflow.service'
import { createCrmLead } from '@/server/services/odoo.service'
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/server/utils/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request)
    const rateLimitResult = rateLimit(`quote-rate:${clientIp}`, RATE_LIMIT_PRESETS.QUOTE_RATE)
    if (!rateLimitResult.allowed) return NextResponse.json({ success: false, error: 'Too many requests. Please wait before requesting another quote.', message: 'Rate limit exceeded' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)), 'X-RateLimit-Limit': String(RATE_LIMIT_PRESETS.QUOTE_RATE.maxRequests), 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetIn / 1000)) } })
    const validation = await validateRequest(request, quoteRateRequestSchema)
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 })
    const reqData = validation.data!
    // ── Dual-Lane Quoter: 3PL LTL (GTZ/WWEX) + PES Asset-Based 26-Ft Box Truck Overflow ──
    const provider = getCarrierProvider()
    let ltlData: NormalizedRateResponse = { lowestCost: null, quickestTransit: null, allCarriers: [] }
    try {
      ltlData = await provider.getRates(reqData)
    } catch (providerErr) {
      console.warn('[Rate] 3PL LTL provider error, evaluating PES Asset-Based Overflow lane:', providerErr)
    }
    const { merged: normalizedData, evaluation: pesOverflow } = attachPesFleetOverflowOption(ltlData, reqData)
    if (normalizedData.lowestCost) {
      const origin = reqData.origin
      const dest = reqData.destination
      const rateCount = (normalizedData.allCarriers?.length) || [normalizedData.lowestCost, normalizedData.quickestTransit].filter((r, i, a) => r && (i === 0 || r.quoteId !== a[0]?.quoteId)).length
      const overflowLine = pesOverflow.eligible
        ? `PES Asset-Based Overflow Eligible: YES ($${pesOverflow.rateUsd.toFixed(2)} · ${pesOverflow.assignedUnitLabel} · Routed via Channel #9 #asset-overflow-to-pes-fleet -> PES Fleet USDOT #7728111)`
        : 'PES Asset-Based Overflow Eligible: NO (3PL LTL Lane Only)'
      createCrmLead({ contactName: reqData.contactName || reqData.email, email: reqData.email, city: origin.city, zip: origin.zip, description: [`Quote Request — ${rateCount} rate(s) returned`, `Route: ${[origin.city, origin.state, origin.zip].filter(Boolean).join(', ')} → ${[dest.city, dest.state, dest.zip].filter(Boolean).join(', ')}`, `Weight: ${pesOverflow.totalWeightLbs} lbs (${pesOverflow.totalPallets} pallets) | Class: ${reqData.items[0]?.productClass ?? '—'}`, `Pickup Date: ${reqData.pickupDate}`, normalizedData.lowestCost ? `Lowest Rate: $${normalizedData.lowestCost.rate} (${normalizedData.lowestCost.carrierName})` : '', overflowLine].filter(Boolean).join('\n') }).catch((err) => { console.error('[Rate] Odoo CRM lead creation failed (non-blocking):', err) })
    }
    return NextResponse.json({ success: true, data: normalizedData, message: normalizedData.lowestCost ? 'Rate quotes retrieved successfully' : 'No rates available for the specified shipment details' }, { status: 200, headers: { 'X-RateLimit-Limit': String(RATE_LIMIT_PRESETS.QUOTE_RATE.maxRequests), 'X-RateLimit-Remaining': String(rateLimitResult.remaining), 'X-RateLimit-Reset': String(Math.ceil(rateLimitResult.resetIn / 1000)) } })
  } catch (error) { return handleApiError(error) }
}
