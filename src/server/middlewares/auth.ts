import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/types';
import {
  resolveAuth,
  readSession,
  type AuthUser,
  type LogtoSession,
} from '@/server/auth/logto';

/**
 * Auth middleware — Portlandia Logistics (DEFECT-08)
 *
 * Replaces the hand-rolled JWT verification with Logto (Riven Auth) session
 * resolution. The session lives in the `riven-auth-session` httpOnly cookie;
 * `resolveAuth` refreshes the access token (if needed) and verifies it against
 * the Logto userinfo endpoint.
 *
 * Two usage patterns are supported (both unchanged from the JWT era):
 *
 *   1. Direct call (most routes):
 *        const user = await withAuth(request);
 *        if (!user) return 401;
 *
 *   2. Higher-order wrapper (portal stats routes):
 *        export const GET = withAuth(handler);   // handler reads request.user
 *
 * `withAdminAuth` works the same way but additionally requires the resolved
 * role to be ADMIN.
 */

// ---------------------------------------------------------------------------
// Augment NextRequest with the `user` property set by the wrapper pattern.
// ---------------------------------------------------------------------------

declare module 'next/server' {
  interface NextRequest {
    user?: AuthUser;
  }
}

// ---------------------------------------------------------------------------
// Re-exported types (kept for backwards compatibility with existing imports).
// ---------------------------------------------------------------------------

export type { AuthUser, LogtoSession } from '@/server/auth/logto';

/** Legacy JWT payload shape — no longer used; kept so existing imports type-check. */
export interface JWTPayload {
  id: string;
  email: string;
  role?: string;
  name?: string;
}

// ---------------------------------------------------------------------------
// Session resolution
// ---------------------------------------------------------------------------

/**
 * Resolve the authenticated user from the Logto session cookie. Returns null
 * when there is no session or the session is no longer valid.
 */
async function resolveUser(request: NextRequest): Promise<AuthUser | null> {
  const { user } = await resolveAuth(request);
  return user;
}

/**
 * Read the role directly from the session cookie WITHOUT a network round-trip.
 * Used by the proxy (middleware) for fast route gating. Falls back to null
 * when the cookie is absent or malformed.
 */
export function getRoleFromSession(request: NextRequest): UserRole | null {
  const session = readSession(request);
  if (!session) return null;
  return session.role;
}

// ---------------------------------------------------------------------------
// Direct-call pattern: withAuth(request) -> Promise<AuthUser | null>
// ---------------------------------------------------------------------------

// The function is overloaded so it can be used as either a direct call or a
// higher-order wrapper. TypeScript resolves the correct overload based on the
// argument shape.

type Handler = (
  request: NextRequest
) => Promise<NextResponse> | NextResponse;

interface WithAuthCallable {
  // Direct call: returns the authenticated user (or null).
  (request: NextRequest): Promise<AuthUser | null>;
  // Higher-order wrapper: returns a handler that gates on auth + sets request.user.
  (handler: Handler): (request: NextRequest) => Promise<NextResponse>;
}

interface WithAdminAuthCallable {
  // Direct call: returns the authenticated admin user (or null).
  (request: NextRequest): Promise<AuthUser | null>;
  // Higher-order wrapper: returns a handler that gates on ADMIN role.
  (handler: Handler): (request: NextRequest) => Promise<NextResponse>;
}

// ---------------------------------------------------------------------------
// withAuth
// ---------------------------------------------------------------------------

export const withAuth: WithAuthCallable = ((
  arg: NextRequest | Handler
): unknown => {
  // Higher-order wrapper pattern: withAuth(handler) -> wrapped handler.
  if (typeof arg === 'function') {
    const handler = arg as Handler;
    return async (request: NextRequest): Promise<NextResponse> => {
      const user = await resolveUser(request);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }
      // Make the user available to the handler via request.user.
      (request as NextRequest & { user?: AuthUser }).user = user;
      return handler(request);
    };
  }
  // Direct-call pattern: withAuth(request) -> Promise<AuthUser | null>.
  return resolveUser(arg as NextRequest);
}) as WithAuthCallable;

// ---------------------------------------------------------------------------
// withAdminAuth
// ---------------------------------------------------------------------------

export const withAdminAuth: WithAdminAuthCallable = ((
  arg: NextRequest | Handler
): unknown => {
  // Higher-order wrapper pattern.
  if (typeof arg === 'function') {
    const handler = arg as Handler;
    return async (request: NextRequest): Promise<NextResponse> => {
      const user = await resolveUser(request);
      if (!user || user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        );
      }
      (request as NextRequest & { user?: AuthUser }).user = user;
      return handler(request);
    };
  }
  // Direct-call pattern.
  return (async () => {
    const user = await resolveUser(arg as NextRequest);
    if (!user || user.role !== UserRole.ADMIN) return null;
    return user;
  })();
}) as WithAdminAuthCallable;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if a resolved user has the admin role.
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === UserRole.ADMIN;
}

/**
 * Legacy token generator — no longer applicable under Logto OIDC.
 *
 * The hand-rolled JWT is gone; sessions are issued by Logto. This stub is kept
 * so any stray imports continue to type-check, but it throws to make the
 * migration explicit. New code must not call it.
 *
 * @deprecated Use the Logto OIDC flow (/api/auth/login) instead.
 */
export function generateToken(
  _payload: JWTPayload,
  _expiresIn?: string | number
): string {
  throw new Error(
    'generateToken() is deprecated: auth is now handled by Logto OIDC. Use /api/auth/login.'
  );
}
