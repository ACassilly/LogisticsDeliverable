/**
 * Stripe Validation Schemas
 *
 * Zod schemas for Stripe checkout and verification endpoints.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Checkout — request body from frontend
// ---------------------------------------------------------------------------

export const checkoutSchema = z.object({
  // Carrier info
  carrierName: z.string().min(1, 'Carrier name is required'),
  carrierCode: z.string().optional(),
  quoteId: z.string().min(1, 'Quote ID is required'),
  totalRate: z.number().positive('Total rate must be positive'),
  charges: z
    .array(
      z.object({
        name: z.string().min(1),
        amount: z.number(),
      })
    )
    .min(1, 'At least one charge is required'),
  transitDays: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  serviceType: z.string().optional(),

  // User
  email: z.string().email('Valid email is required'),

  // Booking data
  pickup: z.object({
    type: z.string(),
    zip: z.string(),
    city: z.string(),
    state: z.string(),
    street: z.string().optional(),
    pickupDate: z.string(),
    liftgateRequired: z.boolean().optional(),
    insidePickup: z.boolean().optional(),
    appointmentRequired: z.boolean().optional(),
  }),
  delivery: z.object({
    type: z.string(),
    zip: z.string(),
    city: z.string(),
    state: z.string(),
    street: z.string().optional(),
    liftgateRequired: z.boolean().optional(),
    insideDelivery: z.boolean().optional(),
    appointmentRequired: z.boolean().optional(),
    notifyReceiverPriorToDelivery: z.boolean().optional(),
  }),
  items: z
    .array(
      z.object({
        description: z.string(),
        pieceCount: z.number(),
        palletCount: z.number(),
        weight: z.number(),
        packageType: z.number(),
        productClass: z.number(),
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        nmfcNumber: z.string().optional(),
        hazmat: z.boolean().optional(),
        stackable: z.boolean().optional(),
        protectFromFreezing: z.boolean().optional(),
      })
    )
    .min(1, 'At least one item is required'),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

// ---------------------------------------------------------------------------
// Verify — session id from Stripe redirect
// ---------------------------------------------------------------------------

export const verifySessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
})

export type VerifySessionInput = z.infer<typeof verifySessionSchema>
