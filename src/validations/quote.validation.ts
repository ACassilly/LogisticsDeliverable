import { z } from "zod"

/** US zip code: 5 digits, optionally -4 */
const zipCodeRegex = /^\d{5}(-\d{4})?$/

/** Returns true if dateStr (YYYY-MM-DD) is today or in the future (local calendar date). */
function isDateTodayOrFuture(val: string): boolean {
  if (!val) return false
  const [selY, selM, selD] = val.split("-").map(Number)
  if (!selY || !selM || !selD) return false
  const now = new Date()
  const todayNum = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
  const selNum = selY * 10000 + selM * 100 + selD
  return selNum >= todayNum
}

/**
 * Simplified quote form schema — only the fields shown to the user.
 * All other GTZShip-required fields are hardcoded in the form's onSubmit.
 */
export const quoteFormSchema = z.object({
  // Origin
  originZip: z
    .string()
    .min(1, "Origin zip code is required")
    .regex(zipCodeRegex, "Enter a valid US zip code (e.g. 85008)"),
  originCity: z.string().optional(),
  originState: z
    .string()
    .max(2, "Enter a 2-letter state code (e.g. AZ)")
    .optional(),

  // Destination
  destinationZip: z
    .string()
    .min(1, "Destination zip code is required")
    .regex(zipCodeRegex, "Enter a valid US zip code (e.g. 77868)"),
  destinationCity: z.string().optional(),
  destinationState: z
    .string()
    .max(2, "Enter a 2-letter state code (e.g. TX)")
    .optional(),

  // Shipment
  pickupDate: z
    .string()
    .min(1, "Pickup date is required")
    .refine(isDateTodayOrFuture, "Pickup date must be today or in the future"),

  weight: z
    .number({ message: "Weight is required" })
    .min(1, "Weight must be at least 1 lb"),

  // Item
  freightClass: z.string().min(1, "Freight class is required"),

  // Contact
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
})

export type QuoteFormData = z.infer<typeof quoteFormSchema>
