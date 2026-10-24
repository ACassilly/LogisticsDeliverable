/**
 * Supplier Fill → Landed-Cost → Payment Gate
 *
 * Implements the PES self-service moat discipline on the freight platform:
 *   1. A quote may self-serve only when supplier fill is VERIFIED
 *      (confirmed in writing), in stock, and — for US installs of
 *      cert-gated categories — a UL variant (never IEC).
 *   2. Landed cost = unit*qty + inbound + outbound + fuel + accessorials,
 *      compared corridor-by-corridor, never on headline unit price.
 *   3. Payment follows carrier acceptance: no BOL/PRO means no charge.
 *
 * This composes with the existing carrier abstraction
 * (src/server/services/carriers) and never duplicates it.
 */

import { BadRequestError } from '@/server/middlewares'

// ============================================================
// Types
// ============================================================

/** Certification class of a supplier fill. */
export type FillCert = 'UL' | 'IEC' | 'NONE'

/**
 * A supplier fill row — mirrors the PES supplier ledger columns.
 */
export interface SupplierFill {
  supplier: string
  partNumber: string
  cert: FillCert
  stock: number
  unitPriceUsd: number
  leadTimeDays: number
  productUrl?: string
  /** Confirmed in writing against the verified supplier ledger. */
  verified: boolean
}

/**
 * Categories whose parts must be UL-rated to be legal on a US install.
 * Batteries: UL 9540 / 1973. MLPE: UL 1741 / 3703. Inverters: UL 1741.
 * Panels/modules: UL listing.
 */
export const UL_REQUIRED_CATEGORIES = ['module', 'mlpe', 'inverter', 'battery'] as const
export type UlRequiredCategory = (typeof UL_REQUIRED_CATEGORIES)[number]

/** Hazmat handling required by a category. */
export type HazmatClass = 'NONE' | 'CLASS9_BATTERY' | 'REFRIGERANT'

/**
 * Landed-cost breakdown in USD.
 */
export interface LandedCostBreakdown {
  subtotal: number
  inboundFreight: number
  outboundFreight: number
  fuelSurcharge: number
  accessorials: number
  /** Route outcome: self-serve or human escape. */
  route: 'SELF_SERVE' | 'HUMAN_ESCAPE'
  /** When route is HUMAN_ESCAPE, the reason is always populated. */
  reason?: string
}

// ============================================================
// Resale margins by mode (Portlandia resale doctrine)
// ============================================================

const MODE_MARGINS: Record<string, number> = {
  LTL: 0.18,
  FTL: 0.15,
  FCL: 0.25,
  LCL: 0.3,
  EXPEDITED: 0.22,
  SPECIALIZED: 0.2,
}

/**
 * Hazmat fixed surcharges (USD).
 * Refrigerant = ground-only contiguous US + fixed surcharge (EPA 608 at cart).
 * Batteries = Class 9 lithium adder.
 */
const HAZMAT_SURCHARGE: Record<Exclude<HazmatClass, 'NONE'>, number> = {
  CLASS9_BATTERY: 120,
  REFRIGERANT: 85,
}

const RESIDENTIAL_LIFTGATE = 75

// ============================================================
// Supplier-fill gate
// ============================================================

/**
 * Validate a supplier fill against the requested quantity and category.
 * Returns a HUMAN_ESCAPE breakdown with a reason when the fill fails.
 */
export function validateSupplierFill(
  fill: SupplierFill,
  qty: number,
  category: string,
): LandedCostBreakdown | null {
  if (!fill.verified) {
    return { subtotal: 0, inboundFreight: 0, outboundFreight: 0, fuelSurcharge: 0, accessorials: 0, route: 'HUMAN_ESCAPE', reason: 'fill unverified' }
  }
  if (qty > fill.stock) {
    return { subtotal: 0, inboundFreight: 0, outboundFreight: 0, fuelSurcharge: 0, accessorials: 0, route: 'HUMAN_ESCAPE', reason: `stock short: ${fill.stock} < ${qty}` }
  }
  if (UL_REQUIRED_CATEGORIES.includes(category as UlRequiredCategory) && fill.cert !== 'UL') {
    return { subtotal: 0, inboundFreight: 0, outboundFreight: 0, fuelSurcharge: 0, accessorials: 0, route: 'HUMAN_ESCAPE', reason: `${category} needs UL, got ${fill.cert} (IEC fails US inspection)` }
  }
  return null
}

// ============================================================
// Landed-cost computation
// ============================================================

export interface LandedCostInput {
  fill: SupplierFill
  qty: number
  category: string
  hazmat: HazmatClass
  /** Carrier rate in USD for this shipment (from the provider abstraction). */
  carrierRateUsd: number
  serviceMode: string
  /** Fuel surcharge multiplier, default 12%. */
  fuelMultiplier?: number
  liftgate?: boolean
}

/**
 * Compute landed cost + route for a self-serve candidate fill.
 * The carrier rate must come from the carrier abstraction — never re-derived here.
 */
export function computeLandedCost(input: LandedCostInput): LandedCostBreakdown {
  const gate = validateSupplierFill(input.fill, input.qty, input.category)
  if (gate) return gate

  const { fill, qty, carrierRateUsd, serviceMode, hazmat, liftgate } = input
  const subtotal = fill.unitPriceUsd * qty
  const inboundFreight = 0 // FOB-origin: PES arranges its own pickup
  const outboundFreight = carrierRateUsd
  const fuelSurcharge = round2(outboundFreight * (input.fuelMultiplier ?? 0.12))
  const accessorials = round2(
    (hazmat !== 'NONE' ? HAZMAT_SURCHARGE[hazmat] : 0) +
      (liftgate ? RESIDENTIAL_LIFTGATE : 0),
  )

  return {
    subtotal: round2(subtotal),
    inboundFreight,
    outboundFreight: round2(outboundFreight),
    fuelSurcharge,
    accessorials,
    route: 'SELF_SERVE',
  }
}

/**
 * Apply Portlandia resale margin by service mode.
 * Returns the sell-side freight (cost / (1 - margin)).
 */
export function applyResaleMargin(carrierRateUsd: number, mode: string): number {
  const margin = MODE_MARGINS[mode] ?? MODE_MARGINS.LTL
  if (margin >= 1) throw new BadRequestError('Invalid resale margin for mode')
  return round2(carrierRateUsd / (1 - margin))
}

/**
 * Total landed (sell) for a quote = subtotal + resale-margined freight
 * + fuel + accessorials, which is what the self-serve total closes on.
 */
export function totalLandedFromFill(input: LandedCostInput): LandedCostBreakdown & { total: number; perUnit: number } {
  const base = computeLandedCost(input)
  if (base.route === 'HUMAN_ESCAPE') return { ...base, total: 0, perUnit: 0 }
  const sellFreight = applyResaleMargin(input.carrierRateUsd, input.serviceMode)
  const total = round2(base.subtotal + sellFreight + base.fuelSurcharge + base.accessorials)
  return { ...base, outboundFreight: sellFreight, total, perUnit: round2(total / input.qty) }
}

// ============================================================
// Payment gate
// ============================================================

/**
 * Payment follows carrier acceptance: a charge may proceed only when the
 * carrier has returned a BOL/PRO. This is the money-path safety gate.
 */
export function canChargeAfterBooking(booking: { bol?: string; pro?: string } | null): boolean {
  if (!booking) return false
  return Boolean(booking.bol && booking.pro)
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}