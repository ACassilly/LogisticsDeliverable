/**
 * Logto OIDC integration — Portlandia Logistics
 *
 * DEFECT-08: Replaces the hand-rolled JWT auth with Logto (Riven Auth) OIDC.
 *
 * Implements the Authorization Code flow with PKCE (RFC 7636) against the
 * Riven Auth (Logto) instance at https://auth.rivenai.io.
 *
 * Session model:
 *   The access / refresh / id tokens plus metadata are stored in a single
 *   httpOnly + Secure cookie named `riven-auth-session` (base64-encoded JSON).
 *   The proxy (middleware) reads the same cookie to gate routes without a
 *   network round-trip; API routes call `getAuthUser()` to verify the access
 *   token against the Logto userinfo endpoint.
 *
 * Env vars:
 *   LOGTO_ENDPOINT          (default: https://auth.rivenai.io)
 *   LOGTO_CLIENT_ID
 *   LOGTO_CLIENT_SECRET
 *   LOGTO_REDIRECT_URI      e.g. https://portlandialogistics.com/api/auth/callback
 *   ADMIN_EMAILS            comma-separated emails that map to UserRole.ADMIN
 *
 * The Logto organization for this tenant is `tbk2rd0qwpcr` and the resource
 * indicator is `https://api.rivenai.io/v1` (Riven billing API). These are
 * passed as `organization_id` / `resource` params on the authorize + token
 * requests so the issued tokens carry the correct scopes.
 */

import type { NextRequest } from 'next/server';
import { UserRole } from '@/types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SESSION_COOKIE = 'riven-auth-session';
const PKCE_COOKIE = 'riven-auth-pkce';

/** Logto organization id for the Portlandia tenant. */
const ORGANIZATION_ID = 'tbk2rd0qwpcr';
/** Tenant slug / domain (informational). */
const TENANT_SLUG = 'portlandia-logistics';

function getEndpoint(): string {
  return (process.env.LOGTO_ENDPOINT || 'https://auth.rivenai.io').replace(/\/$/, '');
}

function getClientId(): string {
  const id = process.env.LOGTO_CLIENT_ID;
  if (!id) throw new Error('LOGTO_CLIENT_ID is not configured.');
  return id;
}

function getClientSecret(): string {
  const secret = process.env.LOGTO_CLIENT_SECRET;
  if (!secret) throw new Error('LOGTO_CLIENT_SECRET is not configured.');
  return secret;
}

function getRedirectUri(): string {
  const uri = process.env.LOGTO_REDIRECT_URI;
  if (!uri) throw new Error('LOGTO_REDIRECT_URI is not configured.');
  return uri;
}

/** Riven billing API resource indicator (audience). */
const RIVEN_RESOURCE = 'https://api.rivenai.io';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LogtoSession {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  tokenType: string;
  /** Unix epoch ms when the access token expires. */
  expiresAt: number;
  /** App-derived role (mapped from Logto userinfo + ADMIN_EMAILS). */
  role: UserRole;
  /** Cached userinfo sub + email so middleware can gate without a round trip. */
  sub: string;
  email: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

interface UserInfoResponse {
  sub: string;
  email?: string;
  name?: string;
  username?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// PKCE helpers (RFC 7636)
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically random code_verifier (43-128 chars, base64url).
 */
export function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/**
 * Async SHA-256 → base64url code_challenge (S256).
 */
export async function computeCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes: Uint8Array): string {
  const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return Buffer.from(bin, 'binary').toString('base64url');
}

// ---------------------------------------------------------------------------
// Session cookie (de)serialization
// ---------------------------------------------------------------------------

function encodeSession(session: LogtoSession): string {
  return Buffer.from(JSON.stringify(session), 'utf8').toString('base64url');
}

function decodeSession(raw: string): LogtoSession | null {
  try {
    const json = Buffer.from(raw, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as LogtoSession;
    if (!parsed || typeof parsed.accessToken !== 'string' || typeof parsed.expiresAt !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const PKCE_COOKIE_NAME = PKCE_COOKIE;

// ---------------------------------------------------------------------------
// Role mapping
// ---------------------------------------------------------------------------

/**
 * Map a Logto user to the app's UserRole.
 *
 * Default: SHIPPER for new users. ADMIN if the user's email is listed in the
 * ADMIN_EMAILS env var (comma-separated, case-insensitive).
 */
export function mapUserRole(email: string | undefined): UserRole {
  if (!email) return UserRole.SHIPPER;
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (adminEmails.includes(email.toLowerCase())) {
    return UserRole.ADMIN;
  }
  return UserRole.SHIPPER;
}

// ---------------------------------------------------------------------------
// OIDC discovery + endpoints
// ---------------------------------------------------------------------------

interface OidcEndpoints {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  revocation_endpoint?: string;
}

let discoveredEndpoints: OidcEndpoints | null = null;

/**
 * Discover OIDC endpoints from `<endpoint>/oidc/.well-known/openid-configuration`.
 * Cached for the lifetime of the process.
 */
async function discoverEndpoints(): Promise<OidcEndpoints> {
  if (discoveredEndpoints) return discoveredEndpoints;
  const endpoint = getEndpoint();
  const res = await fetch(`${endpoint}/oidc/.well-known/openid-configuration`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Logto discovery failed: ${res.status} ${await res.text().catch(() => '')}`);
  }
  const config = (await res.json()) as Partial<OidcEndpoints>;
  if (!config.authorization_endpoint || !config.token_endpoint || !config.userinfo_endpoint) {
    throw new Error('Logto discovery response missing required endpoints.');
  }
  discoveredEndpoints = {
    authorization_endpoint: config.authorization_endpoint,
    token_endpoint: config.token_endpoint,
    userinfo_endpoint: config.userinfo_endpoint,
    end_session_endpoint: config.end_session_endpoint || `${endpoint}/oidc/session/end`,
    revocation_endpoint: config.revocation_endpoint,
  };
  return discoveredEndpoints;
}

// ---------------------------------------------------------------------------
// Authorization URL builder
// ---------------------------------------------------------------------------

export interface BuildAuthorizeUrlResult {
  url: string;
  codeVerifier: string;
  state: string;
}

/**
 * Build the Logto authorize URL with PKCE (S256).
 *
 * @param redirectAfterLogin  app-relative path to return the user to after login.
 */
export async function buildAuthorizeUrl(redirectAfterLogin?: string): Promise<BuildAuthorizeUrlResult> {
  const endpoints = await discoverEndpoints();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await computeCodeChallenge(codeVerifier);
  const state = base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));

  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'openid profile email offline_access',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    // Request tokens for the Riven billing API resource + the tenant org.
    resource: RIVEN_RESOURCE,
    organization_id: ORGANIZATION_ID,
  });
  if (redirectAfterLogin) {
    // Carry the post-login destination inside the state (base64url JSON).
    const payload = base64UrlEncode(
      new TextEncoder().encode(JSON.stringify({ state, redirect: redirectAfterLogin }))
    );
    params.set('state', payload);
  }

  return {
    url: `${endpoints.authorization_endpoint}?${params.toString()}`,
    codeVerifier,
    state,
  };
}

// ---------------------------------------------------------------------------
// Token exchange
// ---------------------------------------------------------------------------

/**
 * Exchange an authorization code for tokens.
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const endpoints = await discoverEndpoints();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: getClientId(),
    client_secret: getClientSecret(),
    code_verifier: codeVerifier,
  });

  const res = await fetch(endpoints.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Logto token exchange failed: ${res.status} ${text}`);
  }
  const tokens = (await res.json()) as TokenResponse;
  if (!tokens.access_token) {
    throw new Error('Logto token response missing access_token.');
  }
  return tokens;
}

/**
 * Refresh an access token using a refresh token (RFC 6749 §6).
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<TokenResponse> {
  const endpoints = await discoverEndpoints();
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: getClientId(),
    client_secret: getClientSecret(),
    // Keep the same resource + org context.
    resource: RIVEN_RESOURCE,
    organization_id: ORGANIZATION_ID,
  });

  const res = await fetch(endpoints.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Logto token refresh failed: ${res.status} ${text}`);
  }
  const tokens = (await res.json()) as TokenResponse;
  if (!tokens.access_token) {
    throw new Error('Logto refresh response missing access_token.');
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// UserInfo
// ---------------------------------------------------------------------------

/**
 * Call the Logto userinfo endpoint with the access token.
 */
export async function fetchUserInfo(accessToken: string): Promise<UserInfoResponse> {
  const endpoints = await discoverEndpoints();
  const res = await fetch(endpoints.userinfo_endpoint, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Logto userinfo failed: ${res.status} ${text}`);
  }
  return (await res.json()) as UserInfoResponse;
}

// ---------------------------------------------------------------------------
// End session URL
// ---------------------------------------------------------------------------

/**
 * Build the Logto end_session URL (RP-initiated logout).
 */
export async function buildEndSessionUrl(postLogoutRedirectUri: string): Promise<string> {
  const endpoints = await discoverEndpoints();
  const params = new URLSearchParams({
    client_id: getClientId(),
    post_logout_redirect_uri: postLogoutRedirectUri,
  });
  return `${endpoints.end_session_endpoint}?${params.toString()}`;
}

/**
 * Revoke a token at the Logto revocation endpoint (best-effort).
 */
export async function revokeToken(token: string, tokenTypeHint: 'access_token' | 'refresh_token' = 'access_token'): Promise<void> {
  try {
    const endpoints = await discoverEndpoints();
    if (!endpoints.revocation_endpoint) return;
    const body = new URLSearchParams({
      token,
      token_type_hint: tokenTypeHint,
      client_id: getClientId(),
      client_secret: getClientSecret(),
    });
    await fetch(endpoints.revocation_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    });
  } catch (err) {
    // Revocation is best-effort; never block logout on it.
    console.error('[Logto] token revocation failed (non-blocking):', err);
  }
}

// ---------------------------------------------------------------------------
// Session helpers (cookie-backed)
// ---------------------------------------------------------------------------

/**
 * Read the raw `riven-auth-session` cookie value from a request.
 */
export function getSessionCookie(request: NextRequest): string | undefined {
  return request.cookies.get(SESSION_COOKIE)?.value;
}

/**
 * Read and decode the session from the `riven-auth-session` cookie.
 */
export function readSession(request: NextRequest): LogtoSession | null {
  const raw = getSessionCookie(request);
  if (!raw) return null;
  return decodeSession(raw);
}

/**
 * Get the access token from the session cookie. If the access token is
 * expired but a refresh token exists, refresh it and return the new token
 * (the caller is responsible for persisting the refreshed session via
 * `getRefreshedSession`).
 */
export async function getAccessToken(request: NextRequest): Promise<string | null> {
  const session = readSession(request);
  if (!session) return null;
  if (session.expiresAt > Date.now()) {
    return session.accessToken;
  }
  // Attempt a refresh.
  if (!session.refreshToken) return null;
  try {
    const refreshed = await refreshAccessToken(session.refreshToken);
    return refreshed.access_token;
  } catch {
    return null;
  }
}

/**
 * Resolve the current authenticated user from the session cookie, refreshing
 * the access token if needed. Returns null when there is no session or the
 * session is no longer valid.
 *
 * Also returns the (possibly refreshed) session so the route handler can
 * rotate the cookie.
 */
export async function resolveAuth(request: NextRequest): Promise<{
  user: AuthUser | null;
  session: LogtoSession | null;
}> {
  const session = readSession(request);
  if (!session) return { user: null, session: null };

  let current = session;
  // Refresh if the access token is within 60s of expiry (or past it).
  if (current.expiresAt <= Date.now() + 60_000 && current.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(current.refreshToken);
      current = {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? current.refreshToken,
        idToken: refreshed.id_token ?? current.idToken,
        tokenType: refreshed.token_type ?? current.tokenType,
        expiresAt: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
        role: current.role,
        sub: current.sub,
        email: current.email,
        name: current.name,
      };
    } catch {
      return { user: null, session: null };
    }
  }

  // Verify the access token against userinfo.
  try {
    const info = await fetchUserInfo(current.accessToken);
    const email = info.email ?? current.email;
    const name = info.name ?? info.username ?? current.name;
    // Re-derive the role each call so ADMIN_EMAILS changes take effect.
    const role = mapUserRole(email);
    const user: AuthUser = {
      id: info.sub,
      email,
      role,
      name,
    };
    // Keep the session in sync with the latest userinfo + role.
    const updated: LogtoSession = {
      ...current,
      role,
      sub: info.sub,
      email,
      name,
    };
    return { user, session: updated };
  } catch {
    // userinfo failed (expired/revoked) and refresh already attempted.
    return { user: null, session: null };
  }
}

/**
 * Get the authenticated user for a request. Calls the Logto userinfo endpoint
 * with the session access token (refreshing first if needed) and maps the
 * result to the app's AuthUser + UserRole.
 *
 * This is the canonical `getAuthUser(req)` helper; `resolveAuth` is the
 * lower-level variant that also returns the (possibly refreshed) session so
 * callers can rotate the cookie.
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const { user } = await resolveAuth(request);
  return user;
}

/**
 * Build a session object from a fresh token response + userinfo.
 */
export async function buildSession(
  tokens: TokenResponse,
  info: UserInfoResponse
): Promise<LogtoSession> {
  const email = info.email ?? '';
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? null,
    idToken: tokens.id_token ?? null,
    tokenType: tokens.token_type ?? 'Bearer',
    expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
    role: mapUserRole(email),
    sub: info.sub,
    email,
    name: info.name ?? info.username ?? '',
  };
}

/**
 * Encode a session for setting as a cookie value.
 */
export function encodeSessionCookie(session: LogtoSession): string {
  return encodeSession(session);
}

/**
 * Decode a session cookie value (inverse of encodeSessionCookie).
 */
export function decodeSessionCookie(raw: string): LogtoSession | null {
  return decodeSession(raw);
}

/**
 * Extract the post-login redirect target from the OIDC `state` param.
 * Returns the app-relative path or null.
 */
export function extractRedirectFromState(state: string): string | null {
  try {
    const json = Buffer.from(state, 'base64url').toString('utf8');
    const parsed = JSON.parse(json) as { redirect?: string };
    return typeof parsed.redirect === 'string' ? parsed.redirect : null;
  } catch {
    return null;
  }
}

// Re-export the cookie names + tenant constants for the routes/middleware.
export { TENANT_SLUG, ORGANIZATION_ID };
