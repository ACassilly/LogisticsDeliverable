/**
 * Frontend Quote Service
 * 
 * API calls for quote/rate-related operations.
 * Sends rate requests to our Next.js API route which proxies to GTZShip.
 */

import { apiClient } from '@/lib/api'
import { QUOTE_API_ENDPOINTS } from '@/constants'
import type { QuoteRateApiResponse, QuoteRateRequestPayload, AllCarrierRateApiResponse } from '@/types'

/**
 * Request a freight rate quote.
 * 
 * @param data - Quote rate request payload with shipment details
 * @returns Promise with the quote rate API response containing lowest cost and quickest transit rates
 * 
 * @example
 * ```ts
 * const result = await getQuoteRate({
 *   pickupDate: '2026-03-10',
 *   stackable: false,
 *   terminalPickup: false,
 *   shipmentNew: false,
 *   email: 'user@example.com',
 *   origin: { zip: '85008' },
 *   destination: { zip: '77868' },
 *   items: [{
 *     description: 'General Freight',
 *     pieceCount: 1,
 *     palletCount: 1,
 *     weight: 1000,
 *     weightType: 1,
 *     productClass: 50,
 *     packageType: 0,
 *     hazmat: false,
 *     stackable: false,
 *   }],
 * })
 * ```
 */
export async function getQuoteRate(
  data: QuoteRateRequestPayload
): Promise<QuoteRateApiResponse> {
  const response = await apiClient.post<QuoteRateApiResponse>(
    QUOTE_API_ENDPOINTS.GET_RATE,
    data
  )
  return response.data
}

/**
 * Request all carrier rates via the V2 API.
 */
export async function getAllCarrierRates(
  data: QuoteRateRequestPayload
): Promise<AllCarrierRateApiResponse> {
  const response = await apiClient.post<AllCarrierRateApiResponse>(
    QUOTE_API_ENDPOINTS.GET_ALL_RATES,
    data
  )
  return response.data
}
