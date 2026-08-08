import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/(auth)/me — DEPRECATED
 *
 * The current-user endpoint is now `GET /api/auth/me`, which resolves the user
 * from the Logto session cookie. This endpoint is kept for backwards
 * compatibility and redirects there.
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/auth/me', request.url));
}
