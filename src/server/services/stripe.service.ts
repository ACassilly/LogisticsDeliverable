/**
 * Stripe Service
 *
 * Manages Stripe Checkout Sessions for one-time freight payments.
 * Uses a lazy singleton pattern (same as email.service.ts).
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 */

import Stripe from 'stripe'

// ---------------------------------------------------------------------------
// Stripe instance (lazy singleton)
// ---------------------------------------------------------------------------

let stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error(
        'Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local'
      )
    }
    stripe = new Stripe(secretKey, { apiVersion: '2026-02-25.clover' })
  }
  return stripe
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CreateCheckoutParams {
  carrierName: string
  totalRate: number // dollars (e.g. 585.42)
  charges: { name: string; amount: number }[]
  quoteId: string
  email: string
  bookingId: string
}

export interface VerifyResult {
  paid: boolean
  paymentStatus: string
  amountTotal: number // cents
  paymentIntentId: string | null
}

// ---------------------------------------------------------------------------
// Create Checkout Session
// ---------------------------------------------------------------------------

export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<{ sessionId: string; sessionUrl: string }> {
  const s = getStripe()

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.charges
    .map((charge) => {
      // Convert dollars → cents, ensure it's a non-negative integer
      // charge.amount can have many decimal places (e.g. 123.456789) and
      // can be negative (discounts). Stripe requires a non-negative integer.
      const cents = Math.max(0, Math.floor(parseFloat(charge.amount.toString()) * 100))
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: charge.name || 'Freight Charge' },
          unit_amount: cents,
        },
        quantity: 1,
      }
    })
    .filter((item) => item.price_data.unit_amount > 0)

  // Fallback: if all charges were zero/negative, use the total rate as a single line item
  const finalLineItems =
    lineItems.length > 0
      ? lineItems
      : [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: `Freight — ${params.carrierName}` },
              unit_amount: Math.max(1, Math.floor(parseFloat(params.totalRate.toString()) * 100)),
            },
            quantity: 1,
          },
        ]

  // Determine the canonical origin for Stripe redirect URLs.
  // Priority:
  //   1. NEXT_PUBLIC_SITE_URL — set explicitly in production (e.g. https://portlandialogistics.com)
  //   2. VERCEL_URL          — auto-injected by Vercel on every deployment
  //   3. localhost fallback  — local dev only
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    'http://localhost:3000'

  const session = await s.checkout.sessions.create({
    mode: 'payment',
    customer_email: params.email,
    line_items: finalLineItems,
    metadata: {
      bookingId: params.bookingId,
      quoteId: params.quoteId,
      carrierName: params.carrierName,
    },
    success_url: `${origin}/quote?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/quote?payment_cancelled=true`,
  })

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL')
  }

  return { sessionId: session.id, sessionUrl: session.url }
}

// ---------------------------------------------------------------------------
// Verify Checkout Session
// ---------------------------------------------------------------------------

export async function verifyCheckoutSession(
  sessionId: string
): Promise<VerifyResult> {
  const s = getStripe()
  const session = await s.checkout.sessions.retrieve(sessionId)

  return {
    paid: session.payment_status === 'paid',
    paymentStatus: session.payment_status,
    amountTotal: session.amount_total ?? 0,
    paymentIntentId:
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
  }
}

// ---------------------------------------------------------------------------
// Construct Webhook Event (signature verification)
// ---------------------------------------------------------------------------

export function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Stripe.Event {
  const s = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error(
      'Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET in .env.local'
    )
  }
  return s.webhooks.constructEvent(body, signature, secret)
}
