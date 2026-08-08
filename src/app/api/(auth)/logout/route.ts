import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/(auth)/logout — DEPRECATED
 *
 * Logout is now handled by `GET/POST /api/auth/logout`, which clears the
 * `riven-auth-session` cookie and redirects to the Logto end_session endpoint.
 * This endpoint is kept for backwards compatibility and redirects there.
 */
export async function POST(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/auth/logout', request.url));
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/auth/logout', request.url));
}
