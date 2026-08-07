/**
 * Carrier Provider Interface
 *
 * Abstraction layer for rate quoting, shipment booking, BOL generation,
 * and shipment tracking across different carrier API providers (GTZ, WWEX).
 *
 * Each provider owns:
 *  - Authentication (Basic Auth, OAuth2, etc.)
 *  - Request transformation (internal → carrier-specific format)
 *  - Response normalization (carrier-specific → internal format)
 *
 * The quote rate route and future booking routes call the provider factory,
 * never the carrier-specific service directly.
 */

import type {
  QuoteRateResult,
  AllCarrierRate,
} from '@/types/quote.types'
import type { QuoteRateRequestInput } from '@/server/validations/quote.validation'

// ============================================================
// Provider Types
// ============================================================

export type CarrierProviderName = 'gtz' | 'wwex'

/**
 * Normalized rate response returned by all providers.
 * Matches the existing frontend-facing shape.
 */
export interface NormalizedRateResponse {
  lowestCost: QuoteRateResult | null
  quickestTransit: QuoteRateResult | null
  allCarriers?: AllCarrierRate[]
}

/**
 * Booking request — sent to the carrier to create a shipment.
 * This is the internal format; each provider transforms it.
 */
export interface CarrierBookingRequest {
  quoteId: string
  carrierName: string
  carrierCode?: string
  totalRate: number
  charges: { name: string; amount: number }[]
  transitDays?: string
  estimatedDeliveryDate?: string
  serviceType?: string
  email: string
  pickup: {
    type: string
    zip: string
    city: string
    state: string
    street?: string
    pickupDate: string
    liftgateRequired?: boolean
    insidePickup?: boolean
    appointmentRequired?: boolean
  }
  delivery: {
    type: string
    zip: string
    city: string
    state: string
    street?: string
    liftgateRequired?: boolean
    insideDelivery?: boolean
    appointmentRequired?: boolean
    notifyReceiverPriorToDelivery?: boolean
  }
  items: Array<{
    description: string
    pieceCount: number
    palletCount: number
    weight: number
    packageType: number
    productClass: number
    length?: number
    width?: number
    height?: number
    nmfcNumber?: string
    hazmat?: boolean
    stackable?: boolean
    protectFromFreezing?: boolean
  }>
}

/**
 * Booking confirmation returned by the carrier after creating a shipment.
 */
export interface CarrierBookingConfirmation {
  orderId: string
  bolNumber: string
  proNumber?: string
  carrierName: string
  carrierConfirmation?: string
  bolDocumentUrl?: string
  pickupDate?: string
  estimatedDelivery?: string
  totalCharge: number
  status: string
}

/**
 * Tracking response from the carrier.
 */
export interface CarrierTrackingResponse {
  bolNumber: string
  proNumber?: string
  carrierName: string
  status: string
  estimatedDelivery?: string
  actualDelivery?: string
  originCity: string
  originState: string
  destinationCity: string
  destinationState: string
  events: Array<{
    eventDateTime: string
    eventCode?: string
    eventDescription: string
    location?: string
    city?: string
    state?: string
  }>
}

// ============================================================
// Provider Interface
// ============================================================

export interface CarrierProvider {
  /** Provider identifier (e.g. 'gtz', 'wwex') */
  readonly name: CarrierProviderName

  /** Human-readable provider name for logs/health checks */
  readonly displayName: string

  /**
   * Get LTL rate quotes (lowest cost + quickest transit).
   * Accepts the internal validated quote input; the provider
   * handles transformation to the carrier-specific format.
   */
  getRates(request: QuoteRateRequestInput): Promise<NormalizedRateResponse>

  /**
   * Get all available carrier rates (V2 / multi-carrier).
   * Optional — providers that don't support this should return null.
   */
  getAllRates?(request: QuoteRateRequestInput): Promise<AllCarrierRate[] | null>

  /**
   * Book a shipment with the carrier.
   * Creates the shipment and returns BOL/PRO numbers.
   */
  bookShipment(request: CarrierBookingRequest): Promise<CarrierBookingConfirmation>

  /**
   * Retrieve BOL document for a booked shipment.
   */
  getBOL(bolNumber: string): Promise<{ url?: string; document?: Buffer } | null>

  /**
   * Track a shipment by BOL or PRO number.
   */
  trackShipment(bolNumber: string): Promise<CarrierTrackingResponse>

  /**
   * Health check — verify provider is configured and reachable.
   * Never prints secrets; returns a sanitized status object.
   */
  healthCheck(): Promise<{ configured: boolean; provider: string; authMode: string; details?: string }>
}

// ============================================================
// Errors
// ============================================================

/**
 * Thrown when a provider method is not yet implemented (e.g. WWEX
 * booking/BOL/tracking before API docs are confirmed).
 */
export class ProviderNotImplementedError extends Error {
  constructor(provider: string, method: string, reason?: string) {
    super(
      `${provider}.${method}() is not implemented${reason ? `: ${reason}` : ''}`
    )
    this.name = 'ProviderNotImplementedError'
  }
}

/**
 * Thrown when a provider is missing required environment variables.
 */
export class ProviderConfigError extends Error {
  constructor(provider: string, missingVars: string[]) {
    super(`${provider} provider is not configured. Missing: ${missingVars.join(', ')}`)
    this.name = 'ProviderConfigError'
  }
}
