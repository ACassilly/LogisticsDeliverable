/**
 * GTZ (GlobalTranz) Carrier Provider
 *
 * Wraps the existing gtzship.service.ts to implement the CarrierProvider
 * interface. No behavior changes — this is a thin adapter layer.
 *
 * Auth: Basic Auth + Ocp-Apim-Subscription-Key
 */

import type {
  CarrierProvider,
  CarrierProviderName,
  NormalizedRateResponse,
  CarrierBookingRequest,
  CarrierBookingConfirmation,
  CarrierTrackingResponse,
} from './types'
import { ProviderNotImplementedError, ProviderConfigError } from './types'
import type { QuoteRateRequestInput } from '@/server/validations/quote.validation'
import { transformToGTZShipRequest } from '@/server/validations/quote.validation'
import {
  getRates,
  normalizeRateResponse,
  getAllRates,
  normalizeV2RateResponse,
} from '@/server/services/gtzship.service'
import type { AllCarrierRate } from '@/types/quote.types'

export class GTZProvider implements CarrierProvider {
  readonly name: CarrierProviderName = 'gtz'
  readonly displayName = 'GlobalTranz (GTZShip)'

  /**
   * Check that required GTZ env vars are set.
   */
  private checkConfig(): void {
    const missing: string[] = []
    if (!process.env.GTZSHIP_API_URL) missing.push('GTZSHIP_API_URL')
    if (!process.env.GTZSHIP_ACCESS_KEY) missing.push('GTZSHIP_ACCESS_KEY')
    if (!process.env.GTZSHIP_USERNAME) missing.push('GTZSHIP_USERNAME')
    if (!process.env.GTZSHIP_PASSWORD) missing.push('GTZSHIP_PASSWORD')
    if (!process.env.GTZSHIP_CUSTOMER_ID) missing.push('GTZSHIP_CUSTOMER_ID')
    if (missing.length > 0) {
      throw new ProviderConfigError('gtz', missing)
    }
  }

  async getRates(request: QuoteRateRequestInput): Promise<NormalizedRateResponse> {
    this.checkConfig()
    const customerId = process.env.GTZSHIP_CUSTOMER_ID!
    const gtzRequest = transformToGTZShipRequest(request, customerId)
    const gtzResponse = await getRates(gtzRequest)
    return normalizeRateResponse(gtzResponse)
  }

  async getAllRates(request: QuoteRateRequestInput): Promise<AllCarrierRate[] | null> {
    // V2 endpoint is optional — requires GTZSHIP_API_URL_V2
    if (!process.env.GTZSHIP_API_URL_V2) return null
    this.checkConfig()
    const customerId = process.env.GTZSHIP_CUSTOMER_ID!
    const gtzRequest = transformToGTZShipRequest(request, customerId)
    const v2Response = await getAllRates(gtzRequest)
    return normalizeV2RateResponse(v2Response)
  }

  async bookShipment(request: CarrierBookingRequest): Promise<CarrierBookingConfirmation> {
    // GTZ booking uses POST /API/Order/ — not yet integrated in the Next.js app.
    // The archived FastAPI portal has a reference implementation (gtz_client.py).
    throw new ProviderNotImplementedError(
      'gtz',
      'bookShipment',
      'GTZ shipment booking (POST /API/Order/) is not yet integrated. Reference: PESConnect/portlandia-logistics-portal backend/app/services/gtz_client.py'
    )
  }

  async getBOL(bolNumber: string): Promise<{ url?: string; document?: Buffer } | null> {
    throw new ProviderNotImplementedError(
      'gtz',
      'getBOL',
      'BOL retrieval is not yet integrated. Reference: PESConnect/portlandia-logistics-portal backend/app/services/bol_service.py'
    )
  }

  async trackShipment(bolNumber: string): Promise<CarrierTrackingResponse> {
    throw new ProviderNotImplementedError(
      'gtz',
      'trackShipment',
      'Shipment tracking is not yet integrated. Reference: PESConnect/portlandia-logistics-portal backend/app/api/routes/tracking.py'
    )
  }

  async healthCheck(): Promise<{ configured: boolean; provider: string; authMode: string; details?: string }> {
    const vars = [
      'GTZSHIP_API_URL',
      'GTZSHIP_ACCESS_KEY',
      'GTZSHIP_USERNAME',
      'GTZSHIP_PASSWORD',
      'GTZSHIP_CUSTOMER_ID',
    ]
    const missing = vars.filter(v => !process.env[v])
    const configured = missing.length === 0
    return {
      configured,
      provider: this.displayName,
      authMode: 'Basic Auth + Ocp-Apim-Subscription-Key',
      details: configured
        ? `endpoint=${process.env.GTZSHIP_API_URL?.replace(/\/+$/, '')}, customerId=${process.env.GTZSHIP_CUSTOMER_ID}`
        : `missing: ${missing.join(', ')}`,
    }
  }
}
