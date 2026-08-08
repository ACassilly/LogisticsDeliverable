import { NextRequest, NextResponse } from 'next/server';
import { buildAuthorizeUrl, PKCE_COOKIE_NAME } from '@/server/auth/logto';

/**
 * GET /api/auth/login
 *
 * Initiates the Logto (Riven Auth) OIDC Authorization Code flow with PKCE.
 * - Generates a code_verifier + S256 code_challenge.
 * - Stores the code_verifier in a short-lived httpOnly cookie for the callback.
 * - Redirects the browser to the Logto authorize endpoint.
 *
 * Optional query: `?redirect=/portal/shipper` — app-relative path to return to
 * after a successful login (carried inside the OIDC `state` param).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const redirect = searchParams.get('redirect') || undefined;

    const { url, codeVerifier } = await buildAuthorizeUrl(redirect);

    const response = NextResponse.redirect(url);
    // Short-lived cookie (10 min) — only needed across the OIDC round-trip.
    response.cookies.set(PKCE_COOKIE_NAME, codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60,
    });
    return response;
  } catch (error) {
    console.error('[auth/login] failed to build authorize URL:', error);
    return NextResponse.json(
      { success: false, error: 'AuthConfiguration', message: 'Failed to start login flow.' },
      { status: 500 }
    );
  }
}
