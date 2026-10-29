/**
 * Dual-Lane LTL + PES Asset-Based 26-Ft Straight Box Truck Overflow Service
 *
 * Plane 2 (portlandialogistics.com / axis.portlandialogistics.com) quotes standard
 * 3PL LTL carriers via the Carrier Provider Factory (GTZ / WWEX W0003023070).
 *
 * When a shipment fits the Non-CDL 26,000 lb GVWR 26-Ft Straight Box Truck profile
 * (1–12 standard pallets, <=14,500 lbs payload) in the Louisville KY / Southern IN /
 * Regional Midwest corridor, this service synthesizes a direct door-to-door
 * Asset-Based Box Truck rate option operated by Portlandia Electric Supply, LLC
 * (USDOT #7728111, Indiana Title #26371206000287 / Plate Visit ID #309694896)
 * and routes overflow work orders from Plane 2 (Channel #9 #asset-overflow-to-pes-fleet)
 * to Plane 1 (axis.pesdistribution.com Project #19 & Channel #36 #fleet-and-dot-compliance).
 */

import type { QuoteRateResult, AllCarrierRate } from '@/types/quote.types'
import type { NormalizedRateResponse } from '@/server/services/carriers/types'
import type { QuoteRateRequestInput } from '@/server/validations/quote.validation'

export const PES_FLEET_CARRIER_CODE = 'PESF'
export const PES_FLEET_CARRIER_NAME =
  'Portlandia Electric Supply Fleet (Dedicated 26-Ft Straight Box Truck · USDOT #7728111)'
export const PES_OVERFLOW_SERVICE_TYPE = 'ASSET_OVERFLOW_TO_PES_FLEET'

const METRO_ZIP3 = new Set(['400', '401', '402', '471'])
const REGIONAL_ZIP3_PREFIXES = [
  '40', '41', '42', // Kentucky
  '46', '47',       // Indiana
  '45', '43', '44', // Ohio
  '37',             // Central/Northern Tennessee (Nashville)
  '62',             // Southern Illinois
]

export interface PesFleetEvaluation {
  eligible: boolean
  corridor: 'METRO_LOCAL' | 'REGIONAL_MIDWEST' | 'OUT_OF_CORRIDOR'
  totalPallets: number
  totalWeightLbs: number
  liftgateRequired: boolean
  assignedUnitVin: string
  assignedUnitLabel: string
  rateUsd: number
  rateResult: QuoteRateResult | null
  allCarrierRate: AllCarrierRate | null
}

function isMetroZip(zip: string): boolean {
  return METRO_ZIP3.has(zip.slice(0, 3))
}

function isRegionalZip(zip: string): boolean {
  const z2 = zip.slice(0, 2)
  return REGIONAL_ZIP3_PREFIXES.includes(z2) || isMetroZip(zip)
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/**
 * Evaluate whether a quote request qualifies for the Asset-Based 26-Ft Box Truck lane
 * and compute its direct door-to-door turn rate.
 */
export function evaluatePesFleetOverflow(
  req: QuoteRateRequestInput,
): PesFleetEvaluation {
  const totalPallets = req.items.reduce((acc, it) => acc + (it.palletCount || 0), 0)
  const totalWeightLbs = req.items.reduce((acc, it) => acc + (it.weight || 0), 0)
  const anyHazmat = req.items.some((it) => it.hazmat)
  const accessorials = req.accessorials ?? []
  const liftgateRequired = accessorials.includes(11) || accessorials.includes(12)

  // Assign Unit #1 (2013 Int'l 4300 Liftgate) when liftgate is requested,
  // otherwise Unit #2 (2014 Int'l 4300 Dock-High · Title #26371206000287 · Plate #309694896)
  const assignedUnitVin = liftgateRequired ? '3HAMMAAL9DL162928' : '3HAMMAAL1EL772145'
  const assignedUnitLabel = liftgateRequired
    ? '2013 International 4300 26-Ft Liftgate Box (VIN 3HAMMAAL9DL162928)'
    : '2014 International 4300 26-Ft Dock-High Box (VIN 3HAMMAAL1EL772145)'

  const originZip = req.origin.zip.trim()
  const destZip = req.destination.zip.trim()
  const bothMetro = isMetroZip(originZip) && isMetroZip(destZip)
  const bothRegional = isRegionalZip(originZip) && isRegionalZip(destZip)

  const corridor = bothMetro
    ? 'METRO_LOCAL'
    : bothRegional
      ? 'REGIONAL_MIDWEST'
      : 'OUT_OF_CORRIDOR'

  // Eligibility: 1-12 standard pallets, <= 14,500 lbs payload (26,000 lb GVWR Class 6 Non-CDL),
  // non-hazmat, within Metro or Regional Midwest corridor.
  if (
    corridor === 'OUT_OF_CORRIDOR' ||
    totalPallets < 1 ||
    totalPallets > 12 ||
    totalWeightLbs < 1 ||
    totalWeightLbs > 14500 ||
    anyHazmat
  ) {
    return {
      eligible: false,
      corridor,
      totalPallets,
      totalWeightLbs,
      liftgateRequired,
      assignedUnitVin,
      assignedUnitLabel,
      rateUsd: 0,
      rateResult: null,
      allCarrierRate: null,
    }
  }

  const baseLinehaul = corridor === 'METRO_LOCAL' ? 475 : 795
  const weightAdder =
    corridor === 'REGIONAL_MIDWEST' && totalWeightLbs > 5000
      ? round2((totalWeightLbs - 5000) * 0.04)
      : 0
  const liftgateCharge = liftgateRequired ? 75 : 0
  const rateUsd = round2(baseLinehaul + weightAdder + liftgateCharge)

  const quoteId = `PLQ-PESF-${Date.now()}`
  const charges = [
    {
      description:
        corridor === 'METRO_LOCAL'
          ? 'Dedicated 26-Ft Straight Box Truck — Local Metro Direct Turn (Zero Cross-Dock)'
          : 'Dedicated 26-Ft Straight Box Truck — Regional Direct Turn (Zero Cross-Dock)',
      amount: (baseLinehaul + weightAdder).toFixed(2),
      type: 'LINEHAUL',
    },
    ...(liftgateCharge > 0
      ? [
          {
            description: '26-Ft Box Truck Hydraulic Liftgate Service',
            amount: liftgateCharge.toFixed(2),
            type: 'ACCESSORIAL',
          },
        ]
      : []),
  ]

  const rateResult: QuoteRateResult = {
    quoteId,
    rate: rateUsd.toFixed(2),
    carrierName: PES_FLEET_CARRIER_NAME,
    carrierPhone: '(502) 790-0600',
    carrierScac: PES_FLEET_CARRIER_CODE,
    transitDays: '1',
    calendarDays: '1',
    estimatedDeliveryDate: req.pickupDate,
    serviceType: PES_OVERFLOW_SERVICE_TYPE,
    customMessage: `Direct Non-CDL 26-Ft Straight Truck (${assignedUnitLabel}) — Routed via Asset-Based Overflow to Portlandia Electric Supply Fleet (USDOT #7728111)`,
    charges,
  }

  const allCarrierRate: AllCarrierRate = {
    quoteId,
    carrierName: PES_FLEET_CARRIER_NAME,
    carrierCode: PES_FLEET_CARRIER_CODE,
    onTimePercentage: 'N/A',
    totalRate: rateUsd,
    transitDays: '1',
    calendarDays: '1',
    estimatedDeliveryDate: req.pickupDate,
    serviceType: PES_OVERFLOW_SERVICE_TYPE,
    customMessage: rateResult.customMessage,
    charges: charges.map((c) => ({ name: c.description, amount: Number(c.amount) })),
  }

  return {
    eligible: true,
    corridor,
    totalPallets,
    totalWeightLbs,
    liftgateRequired,
    assignedUnitVin,
    assignedUnitLabel,
    rateUsd,
    rateResult,
    allCarrierRate,
  }
}

/**
 * Merge the PES Asset-Based 26-Ft Straight Box Truck option into the normalized
 * LTL rate response so the Quote Station presents a true Dual-Lane comparison.
 */
export function attachPesFleetOverflowOption(
  ltlRates: NormalizedRateResponse,
  req: QuoteRateRequestInput,
): { merged: NormalizedRateResponse; evaluation: PesFleetEvaluation } {
  const evaluation = evaluatePesFleetOverflow(req)
  if (!evaluation.eligible || !evaluation.rateResult || !evaluation.allCarrierRate) {
    return { merged: ltlRates, evaluation }
  }

  const pesRate = evaluation.rateResult
  const pesNum = evaluation.rateUsd
  const lowestNum = ltlRates.lowestCost ? Number(ltlRates.lowestCost.rate) : Infinity
  const quickestDays = ltlRates.quickestTransit
    ? Number(ltlRates.quickestTransit.transitDays) || 99
    : 99

  const lowestCost = pesNum < lowestNum ? pesRate : ltlRates.lowestCost ?? pesRate
  const quickestTransit =
    1 <= quickestDays ? pesRate : ltlRates.quickestTransit ?? pesRate

  const existingAll = ltlRates.allCarriers ?? []
  const allCarriers = [evaluation.allCarrierRate, ...existingAll]

  return {
    merged: {
      lowestCost,
      quickestTransit,
      allCarriers,
    },
    evaluation,
  }
}
