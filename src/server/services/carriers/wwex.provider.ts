/**
 * WWEX (World Wide Express) Carrier Provider
 *
 * Implements the CarrierProvider interface for the WWEX speedship.com API.
 *
 * Auth: OAuth2 client_credentials flow
 *   - Token URL:  https://auth.wwex.com/oauth/token
 *   - Audience:   wwex-apig
 *   - Client ID:  WWEX_CLIENT_ID env var
 *   - Secret:     WWEX_CLIENT_SECRET env var
 *   - API base:   WWEX_API_URL (https://www.speedship.com/svc/)
 *
 * STATUS:
 *   - OAuth2 token manager: IMPLEMENTED (fetch, cache, auto-refresh)
 *   - Rate quoting: SCAFFOLD — endpoint/payload shape pending WWEX API docs
 *   - Shipment booking: NOT IMPLEMENTED — pending WWEX API docs
 *   - BOL retrieval: NOT IMPLEMENTED — pending WWEX API docs
 *   - Tracking: NOT IMPLEMENTED — pending WWEX API docs
 *
 * Once WWEX confirms the API schema (Tanya's email reply), fill in the
 * transformation and endpoint logic in getRates/bookShipment/getBOL/trackShipment.
 */

import type {
  CarrierProvider,
  CarrierProviderName,
  NormalizedRateResponse,
  CarrierBookingRequest,
  CarrierBookingConfirmation,
  CarrierTrackingResponse,
} from './types'
import { ProviderNotImplementedError, ProviderConfigError } from './types'
import type { QuoteRateRequestInput } from '@/server/validations/quote.validation'

// ============================================================
// OAuth2 Token Manager
// ============================================================

interface CachedToken {
  accessToken: string
  expiresAt: number // epoch ms
}

/**
 * WWEX OAuth2 token manager.
 *
 * Fetches and caches access tokens using the client_credentials grant.
 * Tokens are refreshed proactively (5 min before expiry) and reactively
 * (on 401 from the API).
 *
 * Never logs the token value — only its expiry and length.
 */
class WWEXTokenManager {
  private cachedToken: CachedToken | null = null
  private fetchPromise: Promise<string> | null = null

  /**
   * Required env vars for OAuth2.
   */
  private static REQUIRED_VARS = [
    'WWEX_CLIENT_ID',
    'WWEX_CLIENT_SECRET',
    'WWEX_AUTH_URL',
    'WWEX_AUDIENCE',
  ]

  /**
   * Check that all OAuth2 env vars are present.
   */
  static validateConfig(): string[] {
    return WWEXTokenManager.REQUIRED_VARS.filter(v => !process.env[v])
  }

  /**
   * Get a valid access token, fetching a new one if needed.
   * Uses a deduplication lock so concurrent callers share one fetch.
   */
  async getToken(): Promise<string> {
    // Return cached token if it has > 5 min of life left
    if (this.cachedToken && this.cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
      return this.cachedToken.accessToken
    }

    // Deduplicate: if a fetch is already in-flight, wait for it
    if (this.fetchPromise) {
      return this.fetchPromise
    }

    this.fetchPromise = this.fetchNewToken()
    try {
      return await this.fetchPromise
    } finally {
      this.fetchPromise = null
    }
  }

  /**
   * Force-refresh the token (called on 401 from the API).
   */
  async refreshToken(): Promise<string> {
    this.cachedToken = null
    return this.getToken()
  }

  /**
   * Fetch a new token from the OAuth2 token endpoint.
   */
  private async fetchNewToken(): Promise<string> {
    const clientId = process.env.WWEX_CLIENT_ID
    const clientSecret = process.env.WWEX_CLIENT_SECRET
    const authUrl = process.env.WWEX_AUTH_URL
    const audience = process.env.WWEX_AUDIENCE

    if (!clientId || !clientSecret || !authUrl || !audience) {
      const missing = WWEXTokenManager.validateConfig()
      throw new ProviderConfigError('wwex', missing)
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      audience: audience,
    })

    console.log('[WWEX] Fetching OAuth2 token from', authUrl)

    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      // Never log the full error body — it may contain token fragments
      console.error('[WWEX] Token endpoint returned', response.status)
      throw new Error(`WWEX OAuth2 token fetch failed (HTTP ${response.status})`)
    }

    const data = await response.json() as {
      access_token: string
      expires_in?: number
      token_type?: string
    }

    if (!data.access_token) {
      throw new Error('WWEX OAuth2 token response missing access_token')
    }

    const expiresIn = data.expires_in ?? 3600 // default 1 hour
    this.cachedToken = {
      accessToken: data.access_token,
      expiresAt: Date.now() + expiresIn * 1000,
    }

    console.log(`[WWEX] Token acquired, expires in ${expiresIn}s, length=${data.access_token.length}`)

    return data.access_token
  }
}

// ============================================================
// WWEX Provider
// ============================================================

export class WWEXProvider implements CarrierProvider {
  readonly name: CarrierProviderName = 'wwex'
  readonly displayName = 'World Wide Express (WWEX speedship)'

  private tokenManager = new WWEXTokenManager()

  /**
   * Check that all required WWEX env vars are present.
   */
  private checkConfig(): void {
    const missing = WWEXTokenManager.validateConfig()
    if (!process.env.WWEX_API_URL) missing.push('WWEX_API_URL')
    if (missing.length > 0) {
      throw new ProviderConfigError('wwex', missing)
    }
  }

  /**
   * Build authenticated headers for WWEX API requests.
   */
  private async buildAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.tokenManager.getToken()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  /**
   * Make an authenticated request to the WWEX API.
   * Auto-refreshes the token on 401 and retries once.
   */
  private async fetchWithAuth(
    path: string,
    options: RequestInit = {},
    retry = true
  ): Promise<Response> {
    const baseUrl = process.env.WWEX_API_URL?.replace(/\/+$/, '')
    if (!baseUrl) throw new ProviderConfigError('wwex', ['WWEX_API_URL'])

    const url = `${baseUrl}${path}`
    const headers = await this.buildAuthHeaders()

    const response = await fetch(url, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
      signal: AbortSignal.timeout(30_000),
    })

    // On 401, refresh token and retry once
    if (response.status === 401 && retry) {
      console.warn('[WWEX] Received 401, refreshing token and retrying')
      await this.tokenManager.refreshToken()
      return this.fetchWithAuth(path, options, false)
    }

    return response
  }

  async getRates(request: QuoteRateRequestInput): Promise<NormalizedRateResponse> {
    // ── PENDING WWEX API DOCS ──────────────────────────────────────
    // The WWEX speedship.com API may use a different request/response
    // schema than GTZ. Tanya's email (Aug 6) asked WWEX to confirm:
    //   1. Whether the API shape matches GTZ or needs updated docs
    //   2. What customer ID to use on the WWEX API
    //
    // Once confirmed, implement:
    //   1. Transform QuoteRateRequestInput → WWEX request format
    //   2. Call fetchWithAuth('/rate/ltl', { method: 'POST', body: ... })
    //   3. Normalize WWEX response → NormalizedRateResponse
    //
    // For now, throw a clear error so the provider factory can fall back.
    throw new ProviderNotImplementedError(
      'wwex',
      'getRates',
      'WWEX rate endpoint schema pending confirmation. WWEX was asked to confirm API shape in Tanya\'s Aug 6 email reply.'
    )
  }

  async getAllRates(request: QuoteRateRequestInput): Promise<null> {
    throw new ProviderNotImplementedError(
      'wwex',
      'getAllRates',
      'WWEX all-carrier rates endpoint not yet documented'
    )
  }

  async bookShipment(request: CarrierBookingRequest): Promise<CarrierBookingConfirmation> {
    throw new ProviderNotImplementedError(
      'wwex',
      'bookShipment',
      'WWEX shipment booking endpoint not yet documented'
    )
  }

  async getBOL(bolNumber: string): Promise<{ url?: string; document?: Buffer } | null> {
    throw new ProviderNotImplementedError(
      'wwex',
      'getBOL',
      'WWEX BOL retrieval endpoint not yet documented'
    )
  }

  async trackShipment(bolNumber: string): Promise<CarrierTrackingResponse> {
    throw new ProviderNotImplementedError(
      'wwex',
      'trackShipment',
      'WWEX tracking endpoint not yet documented'
    )
  }

  async healthCheck(): Promise<{ configured: boolean; provider: string; authMode: string; details?: string }> {
    const oauthMissing = WWEXTokenManager.validateConfig()
    const apiMissing = !process.env.WWEX_API_URL ? ['WWEX_API_URL'] : []
    const missing = [...oauthMissing, ...apiMissing]
    const configured = missing.length === 0

    return {
      configured,
      provider: this.displayName,
      authMode: 'OAuth2 client_credentials (Bearer token)',
      details: configured
        ? `endpoint=${process.env.WWEX_API_URL?.replace(/\/+$/, '')}, clientId=${process.env.WWEX_CLIENT_ID?.substring(0, 8)}…, audience=${process.env.WWEX_AUDIENCE}`
        : `missing: ${missing.join(', ')}`,
    }
  }
}
