import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/(auth)/login  — DEPRECATED
 *
 * The hand-rolled email/password login is replaced by Logto (Riven Auth) OIDC.
 * This endpoint is kept for backwards compatibility and responds with a 410
 * (Gone) deprecation notice that points clients to the new SSO flow at
 * `/api/auth/login`.
 *
 * Frontends should navigate the browser to `GET /api/auth/login` (which
 * redirects to Logto) instead of POSTing credentials here.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Deprecated',
      message:
        'Email/password login has been replaced by Riven Auth (Logto) SSO. Redirect to GET /api/auth/login to start the OIDC flow.',
      redirectTo: '/api/auth/login',
    },
    { status: 410 }
  );
}

/**
 * GET /api/(auth)/login — convenience redirect to the new SSO flow.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const target = new URL('/api/auth/login', request.url);
  const redirect = searchParams.get('redirect');
  if (redirect) target.searchParams.set('redirect', redirect);
  return NextResponse.redirect(target);
}
