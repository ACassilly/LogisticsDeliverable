/**
 * Riven Billing Service — Portlandia Logistics
 *
 * DEFECT-09: Replaces the direct Stripe SDK integration with the Riven billing
 * API. One-time freight payments are now created and verified through
 * `RIVEN_BILLING_URL` (default: https://api.rivenai.io/v1) using the user's
 * Logto access token (Bearer) from the auth session.
 *
 * The export surface intentionally mirrors the old `stripe.service.ts` so the
 * route handlers only need an import-path change:
 *
 *   - createCheckoutSession(params) -> { sessionId, sessionUrl }
 *   - verifyCheckoutSession(sessionId) -> { paid, paymentStatus, amountTotal, paymentIntentId }
 *   - constructWebhookEvent(body, signature) -> RivenBillingWebhookEvent
 *
 * Env vars:
 *   RIVEN_BILLING_URL   (default: https://api.rivenai.io/v1)
 *
 * The Bearer token is read from the request's `riven-auth-session` cookie via
 * `getAccessToken` from the Logto auth library; callers pass it through
 * `params.accessToken`.
 */

import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

function getBillingUrl(): string {
  return (process.env.RIVEN_BILLING_URL || 'https://api.rivenai.io/v1').replace(/\/$/, '');
}

// ---------------------------------------------------------------------------
// Types (mirror the old stripe.service.ts surface)
// ---------------------------------------------------------------------------

export interface CreateCheckoutParams {
  carrierName: string;
  totalRate: number; // dollars (e.g. 585.42)
  charges: { name: string; amount: number }[];
  quoteId: string;
  email: string;
  bookingId: string;
  /** Logto access token (Bearer) from the auth session cookie. */
  accessToken?: string;
}

export interface VerifyResult {
  paid: boolean;
  paymentStatus: string;
  amountTotal: number; // cents (kept for parity with the Stripe surface)
  paymentIntentId: string | null;
}

/** Shape returned by constructWebhookEvent — mirrors the old Stripe.Event subset. */
export interface RivenBillingWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      payment_status?: string;
      payment_intent?: string | { id?: string } | null;
    };
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface RivenCheckoutResponse {
  id?: string;
  sessionId?: string;
  url?: string;
  paymentStatus?: string;
  payment_status?: string;
  amountTotal?: number;
  amount_total?: number;
  paid?: boolean;
  paymentIntentId?: string;
  payment_intent?: string | { id?: string } | null;
}

async function rivenBillingFetch(
  path: string,
  init: RequestInit & { accessToken?: string }
): Promise<Response> {
  const url = `${getBillingUrl()}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.accessToken) {
    headers.Authorization = `Bearer ${init.accessToken}`;
  }
  return fetch(url, { ...init, headers, cache: 'no-store' });
}

// ---------------------------------------------------------------------------
// Create Checkout Session
// ---------------------------------------------------------------------------

export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<{ sessionId: string; sessionUrl: string }> {
  // Convert dollar charges → cents (Riven billing expects integer cents).
  const lineItems = params.charges
    .map((charge) => ({
      name: charge.name || 'Freight Charge',
      amount: Math.max(0, Math.floor(parseFloat(charge.amount.toString()) * 100)),
    }))
    .filter((item) => item.amount > 0);

  // Fallback: if all charges were zero/negative, use the total rate as a single line item.
  const finalLineItems =
    lineItems.length > 0
      ? lineItems
      : [
          {
            name: `Freight — ${params.carrierName}`,
            amount: Math.max(1, Math.floor(parseFloat(params.totalRate.toString()) * 100)),
          },
        ];

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    'http://localhost:3000';

  const body = {
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
  };

  const res = await rivenBillingFetch('/billing/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    accessToken: params.accessToken,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Riven billing createCheckoutSession failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as RivenCheckoutResponse;
  const sessionId = data.sessionId ?? data.id;
  const url = data.url;
  if (!sessionId || !url) {
    throw new Error('Riven billing did not return a session id or checkout URL');
  }

  return { sessionId, sessionUrl: url };
}

// ---------------------------------------------------------------------------
// Verify Checkout Session
// ---------------------------------------------------------------------------

export async function verifyCheckoutSession(
  sessionId: string,
  accessToken?: string
): Promise<VerifyResult> {
  const res = await rivenBillingFetch(`/billing/checkout/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    accessToken,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Riven billing verifyCheckoutSession failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as RivenCheckoutResponse;
  const paymentStatus = data.paymentStatus ?? data.payment_status ?? 'unknown';
  const amountTotal = data.amountTotal ?? data.amount_total ?? 0;
  const paymentIntentId =
    typeof data.payment_intent === 'string'
      ? data.payment_intent
      : data.payment_intent?.id ?? data.paymentIntentId ?? null;

  return {
    paid: paymentStatus === 'paid' || data.paid === true,
    paymentStatus,
    amountTotal,
    paymentIntentId,
  };
}

// ---------------------------------------------------------------------------
// Webhook verification
// ---------------------------------------------------------------------------

/**
 * Verify a Riven billing webhook payload.
 *
 * Instead of verifying a Stripe signature locally, we forward the raw body +
 * signature to the Riven billing webhook-verify endpoint, which returns the
 * parsed event (or 400 if the signature is invalid). This keeps the webhook
 * route's switch/case logic identical to the old Stripe handler.
 *
 * @param body       raw request body (string or Buffer)
 * @param signature  value of the `stripe-signature`-style header from Riven
 * @returns the verified, parsed webhook event
 */
export async function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Promise<RivenBillingWebhookEvent> {
  const res = await fetch(`${getBillingUrl()}/billing/webhook/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
      Accept: 'application/json',
    },
    body: typeof body === 'string' ? body : Buffer.from(body).toString('utf8'),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Riven billing webhook verify failed: ${res.status} ${text}`);
  }

  return (await res.json()) as RivenBillingWebhookEvent;
}

// ---------------------------------------------------------------------------
// Convenience: read the access token from the request's auth session cookie.
// ---------------------------------------------------------------------------

/**
 * Resolve the Bearer access token for a Riven billing call from the request's
 * Logto session cookie. Refreshes the token if it is expired.
 */
export async function getAccessTokenFromRequest(request: NextRequest): Promise<string | null> {
  // Lazy import to avoid a circular module dependency at load time.
  const { getAccessToken } = await import('@/server/auth/logto');
  return getAccessToken(request);
}
