/**
 * GTZShip Rate API Types
 * Types for the GTZShip LTL Rate API integration
 */

// ============================================================
// GTZShip API Request Types
// ============================================================

export interface GTZShipAddress {
  Street?: string
  City?: string
  State?: string
  Zip: string
  Country: string
}

export interface GTZShipItem {
  PieceCount: number
  PalletCount: number
  Length?: number
  Width?: number
  Height?: number
  Weight: number
  WeightType: GTZShipWeightType
  ProductClass: number
  LinearFeet?: number
  NmfcNumber?: string
  Description: string
  PackageType: GTZShipPackageType
  Hazmat: boolean
  HazmatClass?: number
  PackingGroupNumber?: string
  UnPoNumber?: string
  Stackable: boolean
}

export interface GTZShipRateRequest {
  CustomerId: string
  GuaranteedRates?: boolean
  PickupDate: string
  ExtremeLength?: number
  ExtremeLengthBundleCount?: number
  Stackable: boolean
  TerminalPickup: boolean
  ContactName?: string
  ValueOfGoods?: number
  ShipmentNew: boolean
  Origin: GTZShipAddress
  Destination: GTZShipAddress
  Items: GTZShipItem[]
  Accessorials?: number[]
}

// ============================================================
// GTZShip API Response Types
// ============================================================

export interface GTZShipCarrierDetail {
  CarrierId?: string
  CarrierName?: string
  CarrierPhone?: string
  SCAC?: string
  LogoUrl?: string
}

export interface GTZShipCharge {
  ChargeDescription?: string
  ChargeAmount?: string
  ChargeType?: string
}

export interface GTZShipGuaranteedRate {
  GuaranteedAmount?: string
  GuaranteedServiceDays?: string
  GuaranteedDeliveryDate?: string
}

export interface GTZShipProhibitedCommodity {
  CarrierId?: string
  CommodityDescription?: string
}

export interface GTZShipRateDetail {
  CustomerId?: string
  CustomerName?: string
  QuoteId: string
  QuoteCreatedDate?: string
  VolumeQuote?: string
  CustomMessage?: string
  LtlAmount: string
  LtlServiceDays: string
  PalletAmount?: string
  PalletServiceDays?: string
  LiabilityPallet?: string
  CarrierDetail?: GTZShipCarrierDetail
  GuaranteedRate?: GTZShipGuaranteedRate
  UsedLoadLiability?: string
  NewLoadLiability?: string
  LtlDeliveryDate?: string
  ProhibitedCommodityList?: GTZShipProhibitedCommodity
  LtlServiceTypeName?: string
  Charges?: GTZShipCharge[]
  IsOceanShipment?: string
  OceanServiceDays?: string
  OceanCarrierName?: string
  OceanCarrierId?: string
  HubZipCode?: string
  MultilegCarrierHubAddress?: string
  MultilegCarrierDetails?: string
  MultilegCarrierShipDays?: string
  OceanDeliveryDate?: string
  OceanPickupDate?: string
  ReleaseValue?: string
  MaxReleaseValue?: string
  OriginTerminalCode?: string
  DestinationTerminalCode?: string
  EstimatedDeliveryDate?: string
  LTLCalendarDays?: string
  OceanCalendarDays?: string
  CalendarDays?: string
  SpotQuoteNumber?: string
  SpotQuoteCreationTime?: string
}

export interface GTZShipRateResponse {
  LowestCostRate: GTZShipRateDetail | null
  QuickestTransitRate: GTZShipRateDetail | null
}

// ============================================================
// GTZShip V2 API Types (All Carrier Rates)
// ============================================================

/** V2 carrier detail — includes performance metrics & carrier code */
export interface GTZShipV2CarrierDetail {
  CarrierId?: string
  CarrierName?: string
  CarrierCode?: string
  CarrierOnTimeforCustomer?: string
  CarrierExceptionForCustomer?: string
  CarrierOnTimeforGTZ?: string
  CarrierExceptionforGTZ?: string
}

/** V2 charge breakdown */
export interface GTZShipV2Charge {
  AccessorialID?: string
  Name?: string
  Charge?: string
}

/** V2 guaranteed rate option */
export interface GTZShipV2GuaranteedRate {
  CarrierId?: string
  Amount?: string
  ServiceDays?: string
  Timeframe?: string
  GuaranteedPricingName?: string
  Charges?: GTZShipV2Charge[]
}

/** V2 prohibited commodity info */
export interface GTZShipV2ProhibitedCommodity {
  Summary?: string
  Description?: string
}

/** Single carrier rate from the V2 response array */
export interface GTZShipV2RateDetail {
  CustomerId?: string
  CustomerName?: string
  QuoteId: string
  QuoteCreatedDate?: string
  VolumeQuote?: string
  CustomMessage?: string
  LtlAmount: string
  LtlServiceDays: string
  PalletAmount?: string
  PalletServiceDays?: string
  LiabilityPallet?: string
  CarrierDetail?: GTZShipV2CarrierDetail
  UsedLoadLiability?: string
  NewLoadLiability?: string
  LtlDeliveryDate?: string
  ProhibitedCommodityList?: GTZShipV2ProhibitedCommodity
  LtlServiceTypeName?: string
  Charges?: GTZShipV2Charge[]
  GuaranteedRate?: GTZShipV2GuaranteedRate
  IsOceanShipment?: string
  OceanServiceDays?: string
  OceanCarrierName?: string
  OceanCarrierId?: string
  HubZipCode?: string
  MultilegCarrierHubAddress?: string
  MultilegCarrierDetails?: string
  MultilegCarrierShipDays?: string
  OceanDeliveryDate?: string
  OceanPickupDate?: string
  ReleaseValue?: string
  MaxReleaseValue?: string
  OriginTerminalCode?: string
  DestinationTerminalCode?: string
  EstimatedDeliveryDate?: string
  LTLCalendarDays?: string
  OceanCalendarDays?: string
  CalendarDays?: string
  SpotQuoteNumber?: string
  SpotQuoteCreationTime?: string
}

/** V2 API returns a flat array of rate details */
export type GTZShipV2RateResponse = GTZShipV2RateDetail[]

/** Normalized V2 carrier rate for frontend display */
export interface AllCarrierRate {
  quoteId: string
  carrierName: string
  carrierCode?: string
  onTimePercentage?: string
  totalRate: number
  transitDays: string
  calendarDays?: string
  estimatedDeliveryDate?: string
  serviceType?: string
  customMessage?: string
  charges: { name: string; amount: number }[]
  guaranteedRate?: {
    amount: string
    serviceDays: string
    timeframe?: string
    name?: string
  }
  newLoadLiability?: string
  usedLoadLiability?: string
}

/** All-carrier rate API response from our backend */
export interface AllCarrierRateApiResponse {
  success: boolean
  data: AllCarrierRate[]
  message?: string
  error?: string
}

// ============================================================
// Enums & Constants
// ============================================================

export enum GTZShipWeightType {
  Kilograms = 0,
  Pounds = 1,
}

export enum GTZShipPackageType {
  StdPallets = 0,
  PalletsNonStd = 1,
  Bags = 2,
  Bales = 3,
  Boxes = 4,
  Bunches = 5,
  Carpets = 6,
  Coils = 7,
  Crates = 8,
  Cylinders = 9,
  Drums = 10,
  Pails = 11,
  Reels = 12,
  Rolls = 13,
  TubesPipes = 14,
  Loose = 15,
  Bundles = 16,
  Tote = 17,
}

/** Map of package type enum values to display labels */
export const PACKAGE_TYPE_LABELS: Record<number, string> = {
  0: "Std Pallets",
  1: "Pallets - Non Std",
  2: "Bags",
  3: "Bales",
  4: "Boxes",
  5: "Bunches",
  6: "Carpets",
  7: "Coils",
  8: "Crates",
  9: "Cylinders",
  10: "Drums",
  11: "Pails",
  12: "Reels",
  13: "Rolls",
  14: "Tubes/Pipes",
  15: "Loose",
  16: "Bundles",
  17: "Tote",
}

/** Common accessorial codes with labels */
export const ACCESSORIAL_OPTIONS = [
  { value: 11, label: "Lift Gate Pickup" },
  { value: 12, label: "Lift Gate Delivery" },
  { value: 13, label: "Residential Pickup" },
  { value: 14, label: "Residential Delivery" },
  { value: 105, label: "Inside Pickup" },
  { value: 15, label: "Inside Delivery" },
  { value: 17, label: "Notify Prior To Arrival" },
  { value: 152, label: "Appointment Pickup" },
  { value: 153, label: "Appointment Delivery" },
  { value: 116, label: "Protect From Freeze" },
  { value: 108, label: "Sort and Segregate" },
  { value: 103, label: "Notification Pickup" },
  { value: 104, label: "Notification Delivery" },
] as const

/** Extended accessorial options (non-commercial locations, etc.) */
export const EXTENDED_ACCESSORIAL_OPTIONS = [
  { value: 39, label: "Non Commercial Delivery - Airport" },
  { value: 41, label: "Non Commercial Delivery - Construction/Utility Site" },
  { value: 43, label: "Non Commercial Delivery - Correctional Facility" },
  { value: 45, label: "Non Commercial Delivery - Military Base" },
  { value: 47, label: "Non Commercial Delivery - Piers/Wharves" },
  { value: 49, label: "Non Commercial Delivery - Storage Facility" },
  { value: 51, label: "Non Commercial Delivery - Church" },
  { value: 53, label: "Non Commercial Delivery - Farm" },
  { value: 55, label: "Non Commercial Delivery - School" },
  { value: 57, label: "Non Commercial Delivery - Ranch" },
  { value: 59, label: "Non Commercial Delivery - Country Club" },
  { value: 61, label: "Non Commercial Delivery - Shopping Mall" },
  { value: 63, label: "Non Commercial Delivery - Mines/Quarries" },
  { value: 65, label: "Non Commercial Delivery - Golf Course" },
  { value: 67, label: "Non Commercial Delivery - Nursing Homes" },
  { value: 69, label: "Non Commercial Delivery - Government Site" },
  { value: 71, label: "Non Commercial Delivery - Container Freight Station" },
  { value: 98, label: "Non Commercial Delivery - Hotel" },
  { value: 120, label: "Non Commercial Pickup - Airport" },
  { value: 121, label: "Non Commercial Pickup - Construction/Utility Site" },
  { value: 122, label: "Non Commercial Pickup - Correctional Facility" },
  { value: 123, label: "Non Commercial Pickup - Military Base" },
  { value: 124, label: "Non Commercial Pickup - Piers/Wharves" },
  { value: 125, label: "Non Commercial Pickup - Storage Facility" },
  { value: 126, label: "Non Commercial Pickup - Church" },
  { value: 127, label: "Non Commercial Pickup - Farm" },
  { value: 128, label: "Non Commercial Pickup - School" },
  { value: 129, label: "Non Commercial Pickup - Ranch" },
  { value: 130, label: "Non Commercial Pickup - Country Club" },
  { value: 131, label: "Non Commercial Pickup - Shopping Malls" },
  { value: 132, label: "Non Commercial Pickup - Mines/Quarries" },
  { value: 133, label: "Non Commercial Pickup - Golf Course" },
  { value: 134, label: "Non Commercial Pickup - Nursing Homes" },
  { value: 135, label: "Non Commercial Pickup - Government Site" },
  { value: 136, label: "Non Commercial Pickup - Container Freight Station" },
  { value: 137, label: "Non Commercial Pickup - Hotel" },
  { value: 138, label: "Non Commercial Pickup - Limited Access" },
  { value: 139, label: "Non Commercial Delivery - Limited Access" },
] as const

/** Valid freight classes for LTL shipping */
export const FREIGHT_CLASSES = [
  50, 55, 60, 65, 70, 77.5, 85, 92.5,
  100, 110, 125, 150, 175, 200, 250, 300, 400, 500,
] as const

// ============================================================
// Frontend / Normalized Types
// ============================================================

/** Normalized rate result for frontend display */
export interface QuoteRateResult {
  quoteId: string
  rate: string
  carrierName: string
  carrierPhone?: string
  carrierScac?: string
  transitDays: string
  calendarDays?: string
  estimatedDeliveryDate?: string
  serviceType?: string
  customMessage?: string
  charges?: Array<{
    description: string
    amount: string
    type?: string
  }>
  guaranteedRate?: {
    amount: string
    serviceDays: string
    deliveryDate: string
  }
  newLoadLiability?: string
  usedLoadLiability?: string
}

/** Full quote rate API response from our backend */
export interface QuoteRateApiResponse {
  success: boolean
  data: {
    lowestCost: QuoteRateResult | null
    quickestTransit: QuoteRateResult | null
  }
  message?: string
  error?: string
}

/** Quote form request shape sent to our API route */
export interface QuoteRateRequestPayload {
  pickupDate: string
  stackable: boolean
  terminalPickup: boolean
  shipmentNew: boolean
  contactName?: string
  email: string
  valueOfGoods?: number
  origin: {
    zip: string
    city?: string
    state?: string
    street?: string
  }
  destination: {
    zip: string
    city?: string
    state?: string
    street?: string
  }
  items: Array<{
    description: string
    pieceCount: number
    palletCount: number
    weight: number
    weightType: number
    productClass: number
    packageType: number
    hazmat: boolean
    stackable: boolean
    length?: number
    width?: number
    height?: number
    nmfcNumber?: string
  }>
  accessorials?: number[]
}
