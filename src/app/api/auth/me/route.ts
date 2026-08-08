import { NextRequest, NextResponse } from 'next/server';
import { resolveAuth, encodeSessionCookie, SESSION_COOKIE_NAME } from '@/server/auth/logto';

/**
 * GET /api/auth/me
 *
 * Returns the current authenticated user from the Logto session cookie.
 * If the access token was refreshed during resolution, the rotated session
 * cookie is set on the response.
 */
export async function GET(request: NextRequest) {
  const { user, session } = await resolveAuth(request);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });

  // Rotate the session cookie if the access token was refreshed.
  if (session) {
    response.cookies.set(SESSION_COOKIE_NAME, encodeSessionCookie(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }

  return response;
}
