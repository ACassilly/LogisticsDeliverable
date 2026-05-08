import { z } from 'zod'
import { FREIGHT_CLASSES } from '@/types/quote.types'

const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/
const validFreightClasses = FREIGHT_CLASSES as readonly number[]

const addressSchema = z.object({
  zip: z.string().min(1, 'Zip code is required').regex(US_ZIP_REGEX, 'Please enter a valid US zip code (e.g., 85008 or 85008-1234)'),
  city: z.string().optional(),
  state: z.string().optional(),
  street: z.string().optional(),
})

const itemSchema = z.object({
  description: z.string().min(1, 'Item description is required').max(200, 'Description must be 200 characters or less'),
  pieceCount: z.number({ message: 'Piece count is required' }).int('Piece count must be a whole number').min(1, 'Piece count must be at least 1'),
  palletCount: z.number({ message: 'Pallet count is required' }).int('Pallet count must be a whole number').min(1, 'Pallet count must be at least 1'),
  weight: z.number({ message: 'Weight is required' }).min(1, 'Weight must be at least 1 lb').max(20000, 'LTL shipments cannot exceed 20,000 lbs per item. For heavier freight, please contact us for FTL options.'),
  weightType: z.number().int().min(0).max(1).default(1),
  productClass: z.number({ message: 'Freight class is required' }).refine((val) => validFreightClasses.includes(val), { message: 'Please select a valid freight class' }),
  packageType: z.number().int().min(0).max(17).default(0),
  hazmat: z.boolean().default(false),
  stackable: z.boolean().default(false),
  length: z.number().min(0, 'Length cannot be negative').optional(),
  width: z.number().min(0, 'Width cannot be negative').optional(),
  height: z.number().min(0, 'Height cannot be negative').optional(),
  nmfcNumber: z.string().optional(),
})

const VALID_ACCESSORIAL_CODES = [11,12,13,14,15,17,18,39,41,43,45,47,49,51,53,55,57,59,61,63,65,67,69,71,98,103,104,105,108,116,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,152,153] as const

export const quoteRateRequestSchema = z.object({
  pickupDate: z
    .string()
    .min(1, 'Pickup date is required')
    .refine((val) => { const isoDate = /^\d{4}-\d{2}-\d{2}$/; const usDate = /^\d{2}\/\d{2}\/\d{4}$/; return isoDate.test(val) || usDate.test(val) }, { message: 'Please enter a valid date' })
    .refine((val) => { const picked = new Date(val); const minDate = new Date(); minDate.setDate(minDate.getDate() + 2); minDate.setHours(0, 0, 0, 0); return picked >= minDate }, { message: 'Pickup date must be at least 2 days from today' }),
  stackable: z.boolean().default(false),
  terminalPickup: z.boolean().default(false),
  shipmentNew: z.boolean().default(false),
  contactName: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  valueOfGoods: z.number().positive().optional(),
  origin: addressSchema,
  destination: addressSchema,
  items: z.array(itemSchema).min(1, 'At least one item is required'),
  accessorials: z.array(z.number().int().refine((val) => (VALID_ACCESSORIAL_CODES as readonly number[]).includes(val), { message: 'Invalid accessorial code' })).optional(),
})

export type QuoteRateRequestInput = z.infer<typeof quoteRateRequestSchema>

export function transformToGTZShipRequest(data: QuoteRateRequestInput, customerId: string) {
  let formattedDate = data.pickupDate
  if (/^\d{4}-\d{2}-\d{2}$/.test(data.pickupDate)) {
    const [year, month, day] = data.pickupDate.split('-')
    formattedDate = `${month}/${day}/${year}`
  }
  return {
    CustomerId: customerId,
    GuaranteedRates: false,
    PickupDate: formattedDate,
    Stackable: data.stackable,
    TerminalPickup: data.terminalPickup,
    ShipmentNew: data.shipmentNew,
    ContactName: data.contactName,
    ValueOfGoods: data.valueOfGoods,
    Origin: { Street: data.origin.street, City: data.origin.city, State: data.origin.state, Zip: data.origin.zip, Country: 'USA' },
    Destination: { Street: data.destination.street, City: data.destination.city, State: data.destination.state, Zip: data.destination.zip, Country: 'USA' },
    Items: data.items.map((item) => ({ PieceCount: item.pieceCount, PalletCount: item.palletCount, Length: item.length ?? 0, Width: item.width ?? 0, Height: item.height ?? 0, Weight: item.weight, WeightType: item.weightType, ProductClass: item.productClass, ...(item.nmfcNumber ? { NmfcNumber: item.nmfcNumber } : {}), Description: item.description, PackageType: item.packageType, Hazmat: item.hazmat, Stackable: item.stackable })),
    ...(data.accessorials && data.accessorials.length > 0 ? { Accessorials: data.accessorials } : {}),
  }
}
