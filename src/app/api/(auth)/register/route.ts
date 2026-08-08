import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/(auth)/register — DEPRECATED
 *
 * Self-registration is now handled by Logto (Riven Auth) SSO. New users are
 * provisioned through the Logto sign-in flow and mapped to the SHIPPER role
 * by default (ADMIN when their email matches ADMIN_EMAILS). This endpoint is
 * kept for backwards compatibility and responds with a 410 (Gone) deprecation
 * notice pointing clients to the new SSO flow.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Deprecated',
      message:
        'Self-registration has been replaced by Riven Auth (Logto) SSO. Redirect to GET /api/auth/login to create an account via Logto.',
      redirectTo: '/api/auth/login',
    },
    { status: 410 }
  );
}

/**
 * GET /api/(auth)/register — convenience redirect to the new SSO flow.
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/api/auth/login', request.url));
}
