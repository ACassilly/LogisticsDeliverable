import { InternalServerError, BadRequestError } from '@/server/middlewares'
import type { GTZShipRateRequest, GTZShipRateResponse, GTZShipRateDetail, GTZShipV2RateDetail, QuoteRateResult, AllCarrierRate } from '@/types'

interface GTZShipConfig { apiUrl: string; accessKey: string; username: string; password: string; customerId: string }

function getGTZShipConfig(): GTZShipConfig {
  const apiUrl = process.env.GTZSHIP_API_URL
  const accessKey = process.env.GTZSHIP_ACCESS_KEY
  const username = process.env.GTZSHIP_USERNAME
  const password = process.env.GTZSHIP_PASSWORD
  const customerId = process.env.GTZSHIP_CUSTOMER_ID
  if (!apiUrl || !accessKey || !username || !password || !customerId) {
    const missing = [!apiUrl && 'GTZSHIP_API_URL', !accessKey && 'GTZSHIP_ACCESS_KEY', !username && 'GTZSHIP_USERNAME', !password && 'GTZSHIP_PASSWORD', !customerId && 'GTZSHIP_CUSTOMER_ID'].filter(Boolean)
    console.error(`[GTZShip] Missing environment variables: ${missing.join(', ')}`)
    throw new InternalServerError('Quote service is not configured. Please contact support.')
  }
  return { apiUrl, accessKey, username, password, customerId }
}

function buildAuthHeaders(config: GTZShipConfig): Record<string, string> {
  const base64Credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64')
  return { 'Authorization': `Basic ${base64Credentials}`, 'Ocp-Apim-Subscription-Key': config.accessKey, 'Content-Type': 'application/json', 'Accept': 'application/json' }
}

const REQUEST_TIMEOUT_MS = 30_000

export async function getRates(requestBody: GTZShipRateRequest): Promise<GTZShipRateResponse> {
  const config = getGTZShipConfig()
  const headers = buildAuthHeaders(config)
  const url = config.apiUrl
  const serializedBody = JSON.stringify(requestBody, (_key, value) => value === undefined ? undefined : value)
  console.log('[GTZShip] Requesting rates:', { url, origin: requestBody.Origin.Zip, destination: requestBody.Destination.Zip, itemCount: requestBody.Items.length, pickupDate: requestBody.PickupDate })
  try {
    const response = await fetch(url, { method: 'POST', headers, body: serializedBody, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    const responseText = await response.text()
    if (!response.ok) {
      if (response.status >= 400 && response.status < 500) {
        let errorMessage = 'Invalid rate request. Please check your shipment details.'
        try { const errorData = JSON.parse(responseText); if (errorData?.Message) errorMessage = errorData.Message; else if (errorData?.message) errorMessage = errorData.message } catch { if (responseText.length < 200) errorMessage = responseText }
        throw new BadRequestError(errorMessage)
      }
      throw new InternalServerError('The rate service is temporarily unavailable. Please try again later.')
    }
    let data: GTZShipRateResponse
    try { data = JSON.parse(responseText) } catch { throw new InternalServerError('Received an invalid response from the rate service.') }
    return data
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof InternalServerError) throw error
    if (error instanceof DOMException && error.name === 'TimeoutError') throw new InternalServerError('The rate service is taking too long to respond. Please try again.')
    console.error('[GTZShip] Network error:', error)
    throw new InternalServerError('Unable to connect to the rate service. Please check your connection and try again.')
  }
}

export function normalizeRateDetail(detail: GTZShipRateDetail): QuoteRateResult {
  return {
    quoteId: detail.QuoteId, rate: detail.LtlAmount, carrierName: detail.CarrierDetail?.CarrierName ?? 'Unknown Carrier', carrierPhone: detail.CarrierDetail?.CarrierPhone, carrierScac: detail.CarrierDetail?.SCAC, transitDays: detail.LtlServiceDays, calendarDays: detail.CalendarDays ?? detail.LTLCalendarDays, estimatedDeliveryDate: detail.EstimatedDeliveryDate ?? detail.LtlDeliveryDate, serviceType: detail.LtlServiceTypeName, customMessage: detail.CustomMessage,
    charges: detail.Charges?.map((c) => ({ description: c.ChargeDescription ?? '', amount: c.ChargeAmount ?? '0', type: c.ChargeType })),
    guaranteedRate: detail.GuaranteedRate?.GuaranteedAmount ? { amount: detail.GuaranteedRate.GuaranteedAmount, serviceDays: detail.GuaranteedRate.GuaranteedServiceDays ?? '', deliveryDate: detail.GuaranteedRate.GuaranteedDeliveryDate ?? '' } : undefined,
    newLoadLiability: detail.NewLoadLiability, usedLoadLiability: detail.UsedLoadLiability,
  }
}

export function normalizeRateResponse(response: GTZShipRateResponse): { lowestCost: QuoteRateResult | null; quickestTransit: QuoteRateResult | null } {
  return { lowestCost: response.LowestCostRate ? normalizeRateDetail(response.LowestCostRate) : null, quickestTransit: response.QuickestTransitRate ? normalizeRateDetail(response.QuickestTransitRate) : null }
}

export async function getAllRates(requestBody: GTZShipRateRequest): Promise<GTZShipV2RateDetail[]> {
  const config = getGTZShipConfig()
  const headers = buildAuthHeaders(config)
  const v2Url = process.env.GTZSHIP_API_URL_V2
  if (!v2Url) throw new InternalServerError('Quote service V2 is not configured. Please contact support.')
  const serializedBody = JSON.stringify(requestBody, (_key, value) => value === undefined ? undefined : value)
  try {
    const response = await fetch(v2Url, { method: 'POST', headers, body: serializedBody, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    const responseText = await response.text()
    if (!response.ok) {
      if (response.status >= 400 && response.status < 500) {
        let errorMessage = 'Invalid rate request. Please check your shipment details.'
        try { const errorData = JSON.parse(responseText); if (errorData?.Message) errorMessage = errorData.Message; else if (errorData?.message) errorMessage = errorData.message } catch { if (responseText.length < 200) errorMessage = responseText }
        throw new BadRequestError(errorMessage)
      }
      throw new InternalServerError('The rate service is temporarily unavailable. Please try again later.')
    }
    let parsed: unknown
    try { parsed = JSON.parse(responseText) } catch { throw new InternalServerError('Received an invalid response from the rate service.') }
    let data: GTZShipV2RateDetail[]
    if (Array.isArray(parsed)) { data = parsed as GTZShipV2RateDetail[] }
    else if (parsed !== null && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      const wrapperKeys = ['RateResults', 'RatesViaApi', 'Rates', 'rates', 'RateDetails', 'rateDetails', 'data', 'Data', 'Results', 'results', 'Items', 'items', 'Response', 'response', 'Content', 'content']
      const found = wrapperKeys.map((k) => obj[k]).find((v) => Array.isArray(v))
      data = found ? (found as GTZShipV2RateDetail[]) : []
    } else { data = [] }
    return data
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof InternalServerError) throw error
    if (error instanceof DOMException && error.name === 'TimeoutError') throw new InternalServerError('The rate service is taking too long to respond. Please try again.')
    throw new InternalServerError('Unable to connect to the rate service. Please check your connection and try again.')
  }
}

export function normalizeV2RateDetail(detail: GTZShipV2RateDetail): AllCarrierRate {
  const charges = (detail.Charges ?? []).map((c) => ({ name: c.Name ?? '', amount: parseFloat(c.Charge ?? '0') }))
  return {
    quoteId: detail.QuoteId, carrierName: detail.CarrierDetail?.CarrierName ?? detail.CustomerName ?? 'Unknown Carrier', carrierCode: detail.CarrierDetail?.CarrierCode, onTimePercentage: detail.CarrierDetail?.CarrierOnTimeforCustomer, totalRate: parseFloat(detail.LtlAmount) || 0, transitDays: detail.LtlServiceDays, calendarDays: detail.CalendarDays ?? detail.LTLCalendarDays, estimatedDeliveryDate: detail.EstimatedDeliveryDate ?? detail.LtlDeliveryDate, serviceType: detail.LtlServiceTypeName, customMessage: detail.CustomMessage, charges,
    guaranteedRate: detail.GuaranteedRate?.Amount ? { amount: detail.GuaranteedRate.Amount, serviceDays: detail.GuaranteedRate.ServiceDays ?? '', timeframe: detail.GuaranteedRate.Timeframe, name: detail.GuaranteedRate.GuaranteedPricingName } : undefined,
    newLoadLiability: detail.NewLoadLiability, usedLoadLiability: detail.UsedLoadLiability,
  }
}

export function normalizeV2RateResponse(response: GTZShipV2RateDetail[]): AllCarrierRate[] {
  if (!Array.isArray(response)) return []
  return response.map(normalizeV2RateDetail)
}
