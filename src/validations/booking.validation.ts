/**
 * Booking Form Validation — aligned with the GTZShip LTL V2 API.
 *
 * Fields, types, and allowed values mirror the GTZShip LTLRequest schema
 * so the form data can be transformed into a valid API payload without
 * any guesswork or mismatched types.
 */

import { z } from "zod"
import { FREIGHT_CLASSES } from "@/types/quote.types"

/** US zip code: 5 digits, optionally -4 */
const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/

const validFreightClasses = FREIGHT_CLASSES as readonly number[]

// ── Location Type ────────────────────────────────────────

export const locationTypeSchema = z.enum(["business", "residence", "trade-show"])

// ── Pickup ────────────────────────────────────────────────

export const pickupDetailsSchema = z.object({
  type: locationTypeSchema,
  zip: z
    .string()
    .min(1, "Zip code is required")
    .regex(US_ZIP_REGEX, "Enter a valid US zip code"),
  city: z.string().min(1, "City is required"),
  state: z
    .string()
    .min(1, "State is required")
    .max(2, "Use a 2-letter state code (e.g. AZ)"),
  street: z.string(),
  pickupDate: z.string().min(1, "Pickup date is required").refine(
    (val) => {
      const picked = new Date(val)
      const minDate = new Date()
      minDate.setDate(minDate.getDate() + 2)
      minDate.setHours(0, 0, 0, 0)
      return picked >= minDate
    },
    { message: "Pickup date must be at least 2 days from today" }
  ),
  // Accessorials
  liftgateRequired: z.boolean(),
  insidePickup: z.boolean(),
  appointmentRequired: z.boolean(),
})

// ── Delivery ──────────────────────────────────────────────

export const deliveryDetailsSchema = z.object({
  type: locationTypeSchema,
  zip: z
    .string()
    .min(1, "Zip code is required")
    .regex(US_ZIP_REGEX, "Enter a valid US zip code"),
  city: z.string().min(1, "City is required"),
  state: z
    .string()
    .min(1, "State is required")
    .max(2, "Use a 2-letter state code (e.g. TX)"),
  street: z.string(),
  // Accessorials
  liftgateRequired: z.boolean(),
  insideDelivery: z.boolean(),
  appointmentRequired: z.boolean(),
  notifyReceiverPriorToDelivery: z.boolean(),
})

// ── Item ──────────────────────────────────────────────────

export const itemDetailsSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or less"),
  pieceCount: z
    .number({ message: "Piece count is required" })
    .int("Must be a whole number")
    .min(1, "Piece count must be at least 1"),
  palletCount: z
    .number({ message: "Pallet count is required" })
    .int("Must be a whole number")
    .min(1, "Pallet count must be at least 1"),
  weight: z
    .number({ message: "Weight is required" })
    .min(1, "Weight must be at least 1 lb")
    .max(20000, "LTL shipments cannot exceed 20,000 lbs per item. For heavier freight, please contact us for FTL options."),
  packageType: z
    .number()
    .int()
    .min(0)
    .max(17),
  productClass: z
    .number({ message: "Freight class is required" })
    .refine((v) => validFreightClasses.includes(v), {
      message: "Select a valid freight class",
    }),
  length: z.number().min(0, "Length cannot be negative"),
  width: z.number().min(0, "Width cannot be negative"),
  height: z.number().min(0, "Height cannot be negative"),
  nmfcNumber: z.string(),
  // Conditions
  hazmat: z.boolean(),
  stackable: z.boolean(),
  protectFromFreezing: z.boolean(),
})

// ── Full Form ─────────────────────────────────────────────

export const bookingFormSchema = z.object({
  pickup: pickupDetailsSchema,
  delivery: deliveryDetailsSchema,
  items: z.array(itemDetailsSchema).min(1, "At least one item is required"),
  carrier: z.string().optional(),
  insuranceAmount: z.number().optional(),
  agreeToTerms: z.boolean().optional(),
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
