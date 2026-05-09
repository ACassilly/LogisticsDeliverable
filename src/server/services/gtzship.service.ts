/**
 * GTZShip Rate API Service
 * 
 * Server-side service for communicating with the GTZShip LTL Rate API.
 * All credentials and API calls are kept server-side for security.
 * 
 * API Documentation: https://api.gtzintegrate.com/docs/
 * Auth: Basic Auth + Ocp-Apim-Subscription-Key header
 */

import { InternalServerError, BadRequestError } from '@/server/middlewares'
import type {
  GTZShipRateRequest,
  GTZShipRateResponse,
  GTZShipRateDetail,
  GTZShipV2RateDetail,
  QuoteRateResult,
  AllCarrierRate,
} from '@/types'

// ============================================================
// Configuration
// ============================================================

interface GTZShipConfig {
  apiUrl: string
  accessKey: string
  username: string
  password: string
  customerId: string
}

/**
 * Read and validate GTZShip configuration from environment variables.
 * Throws InternalServerError if any required variable is missing.
 */
function getGTZShipConfig(): GTZShipConfig {
  const apiUrl = process.env.GTZSHIP_API_URL
  const accessKey = process.env.GTZSHIP_ACCESS_KEY
  const username = process.env.GTZSHIP_USERNAME
  const password = process.env.GTZSHIP_PASSWORD
  const customerId = process.env.GTZSHIP_CUSTOMER_ID

  if (!apiUrl || !accessKey || !username || !password || !customerId) {
    const missing = [
      !apiUrl && 'GTZSHIP_API_URL',
      !accessKey && 'GTZSHIP_ACCESS_KEY',
      !username && 'GTZSHIP_USERNAME',
      !password && 'GTZSHIP_PASSWORD',
      !customerId && 'GTZSHIP_CUSTOMER_ID',
    ].filter(Boolean)

    console.error(`[GTZShip] Missing environment variables: ${missing.join(', ')}`)
    throw new InternalServerError('Quote service is not configured. Please contact support.')
  }

  return { apiUrl, accessKey, username, password, customerId }
}

/**
 * Build authentication headers for GTZShip API requests.
 * - Authorization: Basic base64(username:password)
 * - Ocp-Apim-Subscription-Key: accessKey
 */
function buildAuthHeaders(config: GTZShipConfig): Record<string, string> {
  // Use credentials as-is — the % in passwords is a literal character, not URL encoding
  const base64Credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64')

  return {
    'Authorization': `Basic ${base64Credentials}`,
    'Ocp-Apim-Subscription-Key': config.accessKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
}

// ============================================================
// API Calls
// ============================================================

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 30_000

/**
 * Call the GTZShip Rate API to get the cheapest and fastest LTL rates.
 * 
 * @param requestBody - The validated rate request payload
 * @returns GTZShipRateResponse with LowestCostRate and QuickestTransitRate
 * @throws BadRequestError if GTZShip returns a client error (4xx)
 * @throws InternalServerError if GTZShip returns a server error (5xx) or network failure
 */
export async function getRates(
  requestBody: GTZShipRateRequest
): Promise<GTZShipRateResponse> {
  const config = getGTZShipConfig()
  const headers = buildAuthHeaders(config)
  const url = config.apiUrl

  // Strip undefined values so the API receives a clean JSON body
  const serializedBody = JSON.stringify(requestBody, (_key, value) =>
    value === undefined ? undefined : value
  )

  console.log('[GTZShip] Requesting rates:', {
    url,
    origin: requestBody.Origin.Zip,
    destination: requestBody.Destination.Zip,
    itemCount: requestBody.Items.length,
    pickupDate: requestBody.PickupDate,
  })
  console.log('[GTZShip] Request body:', serializedBody)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: serializedBody,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    // Read response body (may contain error details)
    const responseText = await response.text()

    // Handle non-OK responses
    if (!response.ok) {
      console.error('[GTZShip] API error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText.substring(0, 500),
      })

      if (response.status >= 400 && response.status < 500) {
        // Client errors — likely bad request data
        let errorMessage = 'Invalid rate request. Please check your shipment details.'
        
        try {
          const errorData = JSON.parse(responseText)
          if (errorData?.Message) {
            errorMessage = errorData.Message
          } else if (errorData?.message) {
            errorMessage = errorData.message
          } else if (typeof errorData === 'string') {
            errorMessage = errorData
          }
        } catch {
          // Response wasn't JSON — use the text directly if short enough
          if (responseText.length < 200) {
            errorMessage = responseText
          }
        }

        throw new BadRequestError(errorMessage)
      }

      // Server errors (5xx) or unexpected status codes
      console.error('[GTZShip] Server error body (full):', responseText)
      throw new InternalServerError(
        'The rate service is temporarily unavailable. Please try again later.'
      )
    }

    // Parse successful response
    let data: GTZShipRateResponse
    try {
      data = JSON.parse(responseText)
    } catch {
      console.error('[GTZShip] Failed to parse response JSON:', responseText.substring(0, 500))
      throw new InternalServerError('Received an invalid response from the rate service.')
    }

    console.log('[GTZShip] Rate response received:', {
      hasLowestCost: !!data.LowestCostRate,
      hasQuickestTransit: !!data.QuickestTransitRate,
      lowestCostAmount: data.LowestCostRate?.LtlAmount,
      quickestTransitAmount: data.QuickestTransitRate?.LtlAmount,
    })

    return data
  } catch (error) {
    // Re-throw our custom errors as-is
    if (error instanceof BadRequestError || error instanceof InternalServerError) {
      throw error
    }

    // Handle timeout
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      console.error('[GTZShip] Request timed out after', REQUEST_TIMEOUT_MS, 'ms')
      throw new InternalServerError(
        'The rate service is taking too long to respond. Please try again.'
      )
    }

    // Handle network / fetch errors
    console.error('[GTZShip] Network error:', error)
    throw new InternalServerError(
      'Unable to connect to the rate service. Please check your connection and try again.'
    )
  }
}

// ============================================================
// Response Normalization
// ============================================================

/**
 * Normalize a GTZShip rate detail into our frontend-friendly format.
 * 
 * @param detail - Raw GTZShip rate detail object
 * @returns Normalized QuoteRateResult for the frontend
 */
export function normalizeRateDetail(detail: GTZShipRateDetail): QuoteRateResult {
  return {
    quoteId: detail.QuoteId,
    rate: detail.LtlAmount,
    carrierName: detail.CarrierDetail?.CarrierName ?? 'Unknown Carrier',
    carrierPhone: detail.CarrierDetail?.CarrierPhone,
    carrierScac: detail.CarrierDetail?.SCAC,
    transitDays: detail.LtlServiceDays,
    calendarDays: detail.CalendarDays ?? detail.LTLCalendarDays,
    estimatedDeliveryDate: detail.EstimatedDeliveryDate ?? detail.LtlDeliveryDate,
    serviceType: detail.LtlServiceTypeName,
    customMessage: detail.CustomMessage,
    charges: detail.Charges?.map((c) => ({
      description: c.ChargeDescription ?? '',
      amount: c.ChargeAmount ?? '0',
      type: c.ChargeType,
    })),
    guaranteedRate: detail.GuaranteedRate?.GuaranteedAmount
      ? {
          amount: detail.GuaranteedRate.GuaranteedAmount,
          serviceDays: detail.GuaranteedRate.GuaranteedServiceDays ?? '',
          deliveryDate: detail.GuaranteedRate.GuaranteedDeliveryDate ?? '',
        }
      : undefined,
    newLoadLiability: detail.NewLoadLiability,
    usedLoadLiability: detail.UsedLoadLiability,
  }
}

/**
 * Normalize the full GTZShip rate response into our API response shape.
 * 
 * @param response - Raw GTZShip rate API response
 * @returns Object with normalized lowestCost and quickestTransit results
 */
export function normalizeRateResponse(response: GTZShipRateResponse): {
  lowestCost: QuoteRateResult | null
  quickestTransit: QuoteRateResult | null
} {
  return {
    lowestCost: response.LowestCostRate
      ? normalizeRateDetail(response.LowestCostRate)
      : null,
    quickestTransit: response.QuickestTransitRate
      ? normalizeRateDetail(response.QuickestTransitRate)
      : null,
  }
}

// ============================================================
// V2 API — All Carrier Rates
// ============================================================

/**
 * Call the GTZShip Rate V2 API to get all available carrier rates.
 *
 * Same request schema as V1, but the response is a flat JSON array
 * of rate details (one per carrier).
 */
export async function getAllRates(
  requestBody: GTZShipRateRequest
): Promise<GTZShipV2RateDetail[]> {
  const config = getGTZShipConfig()
  const headers = buildAuthHeaders(config)
  const v2Url = process.env.GTZSHIP_API_URL_V2

  if (!v2Url) {
    console.error('[GTZShip] Missing GTZSHIP_API_URL_V2 environment variable')
    throw new InternalServerError('Quote service V2 is not configured. Please contact support.')
  }

  const serializedBody = JSON.stringify(requestBody, (_key, value) =>
    value === undefined ? undefined : value
  )

  console.log('[GTZShip V2] Request body:', serializedBody)
  console.log('[GTZShip V2] Requesting all carrier rates:', {
    url: v2Url,
    origin: requestBody.Origin.Zip,
    destination: requestBody.Destination.Zip,
    itemCount: requestBody.Items.length,
    pickupDate: requestBody.PickupDate,
  })

  try {
    const response = await fetch(v2Url, {
      method: 'POST',
      headers,
      body: serializedBody,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    const responseText = await response.text()

    if (!response.ok) {
      console.error('[GTZShip V2] API error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText.substring(0, 500),
      })

      if (response.status >= 400 && response.status < 500) {
        let errorMessage = 'Invalid rate request. Please check your shipment details.'
        try {
          const errorData = JSON.parse(responseText)
          if (errorData?.Message) errorMessage = errorData.Message
          else if (errorData?.message) errorMessage = errorData.message
          else if (typeof errorData === 'string') errorMessage = errorData
        } catch {
          if (responseText.length < 200) errorMessage = responseText
        }
        throw new BadRequestError(errorMessage)
      }

      throw new InternalServerError(
        'The rate service is temporarily unavailable. Please try again later.'
      )
    }

    // Log the raw response to help debug unexpected structures
    console.log('[GTZShip V2] Raw response (first 2000 chars):', responseText.substring(0, 2000))

    let parsed: unknown
    try {
      parsed = JSON.parse(responseText)
    } catch {
      console.error('[GTZShip V2] Failed to parse response JSON:', responseText.substring(0, 500))
      throw new InternalServerError('Received an invalid response from the rate service.')
    }

    // The API should return a flat array, but defensively handle wrapped objects too
    let data: GTZShipV2RateDetail[]
    if (Array.isArray(parsed)) {
      data = parsed as GTZShipV2RateDetail[]
    } else if (parsed !== null && typeof parsed === 'object') {
      // Try common wrapper property names used by GTZShip / similar APIs
      const obj = parsed as Record<string, unknown>
      console.warn('[GTZShip V2] Response is an object, not an array. Keys:', Object.keys(obj))
      const wrapperKeys = [
        'RateResults', 'RatesViaApi', 'Rates', 'rates', 'RateDetails', 'rateDetails',
        'data', 'Data', 'Results', 'results', 'Items', 'items',
        'Response', 'response', 'Content', 'content',
      ]
      const found = wrapperKeys.map((k) => obj[k]).find((v) => Array.isArray(v))
      if (found) {
        data = found as GTZShipV2RateDetail[]
        console.log('[GTZShip V2] Extracted rates from wrapper. Count:', data.length)
      } else {
        // Could be an error object — log it and return empty so UI shows "no rates"
        console.warn('[GTZShip V2] Could not find a rate array in response:', JSON.stringify(parsed).substring(0, 500))
        data = []
      }
    } else {
      console.warn('[GTZShip V2] Unexpected response type:', typeof parsed, '— value:', String(parsed).substring(0, 200))
      data = []
    }

    console.log('[GTZShip V2] Rates received:', { count: data.length })
    return data
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof InternalServerError) throw error
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new InternalServerError('The rate service is taking too long to respond. Please try again.')
    }
    console.error('[GTZShip V2] Network error:', error)
    throw new InternalServerError('Unable to connect to the rate service. Please check your connection and try again.')
  }
}

/**
 * Normalize a V2 rate detail into the frontend-friendly AllCarrierRate shape.
 */
export function normalizeV2RateDetail(detail: GTZShipV2RateDetail): AllCarrierRate {
  const charges = (detail.Charges ?? []).map((c) => ({
    name: c.Name ?? '',
    amount: parseFloat(c.Charge ?? '0'),
  }))

  return {
    quoteId: detail.QuoteId,
    carrierName: detail.CarrierDetail?.CarrierName ?? detail.CustomerName ?? 'Unknown Carrier',
    carrierCode: detail.CarrierDetail?.CarrierCode,
    onTimePercentage: detail.CarrierDetail?.CarrierOnTimeforCustomer,
    totalRate: parseFloat(detail.LtlAmount) || 0,
    transitDays: detail.LtlServiceDays,
    calendarDays: detail.CalendarDays ?? detail.LTLCalendarDays,
    estimatedDeliveryDate: detail.EstimatedDeliveryDate ?? detail.LtlDeliveryDate,
    serviceType: detail.LtlServiceTypeName,
    customMessage: detail.CustomMessage,
    charges,
    guaranteedRate: detail.GuaranteedRate?.Amount
      ? {
          amount: detail.GuaranteedRate.Amount,
          serviceDays: detail.GuaranteedRate.ServiceDays ?? '',
          timeframe: detail.GuaranteedRate.Timeframe,
          name: detail.GuaranteedRate.GuaranteedPricingName,
        }
      : undefined,
    newLoadLiability: detail.NewLoadLiability,
    usedLoadLiability: detail.UsedLoadLiability,
  }
}

/**
 * Normalize the full V2 response array.
 */
export function normalizeV2RateResponse(response: GTZShipV2RateDetail[]): AllCarrierRate[] {
  if (!Array.isArray(response)) return []
  return response.map(normalizeV2RateDetail)
}
