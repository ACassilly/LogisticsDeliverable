import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForTokens,
  fetchUserInfo,
  buildSession,
  encodeSessionCookie,
  extractRedirectFromState,
  SESSION_COOKIE_NAME,
  PKCE_COOKIE_NAME,
} from '@/server/auth/logto';

/**
 * GET /api/auth/callback
 *
 * OIDC redirect_uri target. Exchanges the authorization code for tokens
 * (verifying the PKCE code_verifier from the login cookie), fetches userinfo,
 * builds the app session, and stores it in the `riven-auth-session` httpOnly
 * Secure cookie. Then redirects the user to their portal (or the `redirect`
 * carried in the OIDC `state`).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Logto passed back an error (e.g. user denied consent).
  if (errorParam) {
    console.error('[auth/callback] Logto returned error:', errorParam, errorDescription);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', errorParam);
    if (errorDescription) loginUrl.searchParams.set('error_description', errorDescription);
    return NextResponse.redirect(loginUrl);
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

  const codeVerifier = request.cookies.get(PKCE_COOKIE_NAME)?.value;
  if (!codeVerifier) {
    return NextResponse.redirect(new URL('/login?error=missing_pkce', request.url));
  }

  try {
    // 1. Exchange the code for tokens (PKCE verified by Logto).
    const tokens = await exchangeCodeForTokens(code, codeVerifier);

    // 2. Fetch userinfo with the access token.
    const info = await fetchUserInfo(tokens.access_token);

    // 3. Build the app session (maps role, caches sub/email/name).
    const session = await buildSession(tokens, info);

    // 4. Determine the post-login redirect (from state, else role portal).
    const redirect = extractRedirectFromState(state);
    const fallback = '/portal/shipper';
    const target = redirect && redirect.startsWith('/') ? redirect : fallback;

    const response = NextResponse.redirect(new URL(target, request.url));

    // 5. Set the session cookie (httpOnly + Secure in production).
    response.cookies.set(SESSION_COOKIE_NAME, encodeSessionCookie(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days; refresh handles token rotation
    });

    // 6. Clear the short-lived PKCE cookie.
    response.cookies.delete(PKCE_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error('[auth/callback] token exchange / userinfo failed:', error);
    return NextResponse.redirect(new URL('/login?error=callback_failed', request.url));
  }
}
