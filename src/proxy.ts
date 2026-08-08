/**
 * proxy.ts — Next.js 16 replacement for middleware.ts
 *
 * In Next.js 16, middleware.ts is renamed to proxy.ts and the exported
 * function is renamed from `middleware` to `proxy`. The logic is identical.
 * Runs on the Node.js runtime (no Edge limitations).
 *
 * DEFECT-08: Route gating now reads the `riven-auth-session` cookie (Logto OIDC
 * session) instead of decoding the hand-rolled JWT. The cookie is an opaque,
 * httpOnly, base64url-encoded session blob; the proxy only inspects the role
 * field for fast gating — full token verification happens in the API routes
 * via `resolveAuth()` / `withAuth()`.
 *
 * Docs: https://nextjs.org/docs/app/guides/upgrading/version-16#middlewarets-renamed-to-proxysts
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole, ROLE_PORTAL_MAP } from '@/types';
import { readSession, SESSION_COOKIE_NAME } from '@/server/auth/logto';

/**
 * Role-protected route prefixes
 */
const ROLE_PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/admin': [UserRole.ADMIN],
  '/portal/admin': [UserRole.ADMIN],
  '/portal/agent': [UserRole.AGENT, UserRole.ADMIN],
  '/portal/dispatcher': [UserRole.DISPATCHER, UserRole.ADMIN],
  '/portal/shipper': [UserRole.SHIPPER, UserRole.ADMIN],
  '/portal/carrier': [UserRole.CARRIER, UserRole.ADMIN],
  '/portal/leadership': [UserRole.LEADERSHIP, UserRole.ADMIN],
};

/**
 * Public routes that never require auth
 */
const PUBLIC_ROUTES = [
  '/admin/login',
  '/login',
  '/signup',
  '/quote',
  '/track',
  // OIDC auth endpoints must remain reachable without a session.
  '/api/auth/login',
  '/api/auth/callback',
];

/**
 * Read the role from the Logto session cookie (no network round-trip).
 * Returns null when the cookie is absent or malformed.
 */
function getRoleFromSession(request: NextRequest): UserRole | null {
  const session = readSession(request);
  if (!session) return null;
  return session.role;
}

/**
 * proxy — Next.js 16 renamed from `middleware`
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    // If already authenticated and hitting login, redirect to their portal
    if (pathname === '/login' || pathname === '/admin/login') {
      const session = readSession(request);
      if (session) {
        const role = session.role;
        if (role && Object.values(UserRole).includes(role)) {
          return NextResponse.redirect(new URL(ROLE_PORTAL_MAP[role], request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Check if route requires role protection
  const matchedPrefix = Object.keys(ROLE_PROTECTED_ROUTES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (matchedPrefix) {
    // The session cookie is the source of truth (server-side verified).
    const session = readSession(request);
    const role = session?.role ?? null;

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const allowedRoles = ROLE_PROTECTED_ROUTES[matchedPrefix];

    if (!role || !allowedRoles.includes(role)) {
      if (role && Object.values(UserRole).includes(role)) {
        return NextResponse.redirect(new URL(ROLE_PORTAL_MAP[role], request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/portal/:path*',
    '/login',
    '/admin/login',
  ],
};

// Re-export the cookie name for any code that needs to reference it.
export { SESSION_COOKIE_NAME };
