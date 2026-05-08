/**
 * Booking form types — aligned with the GTZShip LTL Rate V2 API.
 *
 * Location types map to accessorials:
 *  - "business"   → no residential accessorial
 *  - "residence"  → Residential Pickup (13) / Residential Delivery (14)
 *  - "trade-show" → no standard accessorial (informational only)
 */

export type LocationType = "business" | "residence" | "trade-show"

export type BookingStep = "order-details" | "choose-carrier" | "finalize" | "payment"

export type OrderDetailsSubStep = "pickup" | "delivery" | "items"

export type DetailsMicroStep = "type" | "where-when" | "additional-services"

export type ItemMicroStep = "details" | "conditions"

// ── Pickup ────────────────────────────────────────────────

export interface PickupDetails {
  type: LocationType
  zip: string
  city: string
  state: string
  street: string
  pickupDate: string
  // Accessorials
  liftgateRequired: boolean   // 11 – Lift Gate Pickup
  insidePickup: boolean       // 105 – Inside Pickup
  appointmentRequired: boolean // 152 – Appointment Pickup
}

// ── Delivery ──────────────────────────────────────────────

export interface DeliveryDetails {
  type: LocationType
  zip: string
  city: string
  state: string
  street: string
  // Accessorials
  liftgateRequired: boolean              // 12 – Lift Gate Delivery
  insideDelivery: boolean                // 15 – Inside Delivery
  appointmentRequired: boolean           // 153 – Appointment Delivery
  notifyReceiverPriorToDelivery: boolean // 17 – Notify Prior To Arrival
}

// ── Item ──────────────────────────────────────────────────

export interface ItemDetails {
  description: string
  pieceCount: number
  palletCount: number
  weight: number
  packageType: number     // GTZShip PackageType enum (0–17)
  productClass: number    // Freight class (50, 55, … 500)
  length: number
  width: number
  height: number
  nmfcNumber: string
  // Conditions
  hazmat: boolean
  stackable: boolean
  protectFromFreezing: boolean  // Accessorial 116
}

// ── Full Form ─────────────────────────────────────────────

export interface BookingFormData {
  pickup: PickupDetails
  delivery: DeliveryDetails
  items: ItemDetails[]
  carrier?: string
  insuranceAmount?: number
  agreeToTerms?: boolean
}
