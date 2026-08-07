/**
 * Carrier Provider Factory
 *
 * Selects and instantiates the carrier provider based on the
 * CARRIER_PROVIDER environment variable.
 *
 * Defaults to 'gtz' (GlobalTranz) for backward compatibility.
 * Set CARRIER_PROVIDER=wwex to use the WWEX provider.
 *
 * Usage:
 *   import { getCarrierProvider } from '@/server/services/carriers'
 *   const provider = getCarrierProvider()
 *   const rates = await provider.getRates(validatedInput)
 */

import type { CarrierProvider, CarrierProviderName } from './types'
import { GTZProvider } from './gtz.provider'
import { WWEXProvider } from './wwex.provider'

// ============================================================
// Provider Registry
// ============================================================

const providers: Partial<Record<CarrierProviderName, CarrierProvider>> = {}

/**
 * Get the configured carrier provider (singleton per provider name).
 *
 * Selection logic:
 *   1. CARRIER_PROVIDER env var → explicit selection
 *   2. Default → 'gtz'
 *
 * If the selected provider is not configured (missing env vars),
 * it is still returned — the caller will get a ProviderConfigError
 * when they call a method that needs the missing vars.
 */
export function getCarrierProvider(): CarrierProvider {
  const requested = (process.env.CARRIER_PROVIDER || 'gtz') as CarrierProviderName

  // Validate the provider name
  if (requested !== 'gtz' && requested !== 'wwex') {
    console.warn(`[CarrierProvider] Unknown CARRIER_PROVIDER="${requested}", falling back to gtz`)
    return getOrCreate('gtz')
  }

  return getOrCreate(requested)
}

/**
 * Get a specific provider by name (for health checks, parallel testing, etc.).
 */
export function getProvider(name: CarrierProviderName): CarrierProvider {
  return getOrCreate(name)
}

/**
 * Get all registered provider names (for health-check endpoints).
 */
export function getAllProviderNames(): CarrierProviderName[] {
  return ['gtz', 'wwex']
}

// ============================================================
// Internal
// ============================================================

function getOrCreate(name: CarrierProviderName): CarrierProvider {
  if (!providers[name]) {
    switch (name) {
      case 'gtz':
        providers[name] = new GTZProvider()
        break
      case 'wwex':
        providers[name] = new WWEXProvider()
        break
    }
  }
  return providers[name]!
}

// Re-export types and errors for convenience
export type { CarrierProvider, CarrierProviderName, NormalizedRateResponse, CarrierBookingRequest, CarrierBookingConfirmation, CarrierTrackingResponse } from './types'
export { ProviderNotImplementedError, ProviderConfigError } from './types'
