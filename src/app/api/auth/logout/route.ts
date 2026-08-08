import { NextRequest, NextResponse } from 'next/server';
import {
  readSession,
  buildEndSessionUrl,
  revokeToken,
  SESSION_COOKIE_NAME,
} from '@/server/auth/logto';

/**
 * GET /api/auth/logout
 *
 * Clears the local `riven-auth-session` cookie and redirects the browser to
 * the Logto end_session endpoint (RP-initiated logout). After Logto clears its
 * SSO session, the user is returned to the site root.
 *
 * Supports both GET (link navigation) and POST (programmatic) so the client
 * auth store can call either.
 */
async function performLogout(request: NextRequest) {
  const session = readSession(request);

  // Best-effort: revoke the tokens at Logto before clearing the cookie.
  if (session) {
    if (session.refreshToken) {
      await revokeToken(session.refreshToken, 'refresh_token');
    }
    await revokeToken(session.accessToken, 'access_token');
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL('/', request.url).toString();
  const endSessionUrl = await buildEndSessionUrl(siteUrl);

  const response = NextResponse.redirect(endSessionUrl);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function GET(request: NextRequest) {
  return performLogout(request);
}

export async function POST(request: NextRequest) {
  return performLogout(request);
}
