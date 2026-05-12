/**
 * proxy.ts — Next.js 16 replacement for middleware.ts
 * 
 * In Next.js 16, middleware.ts is renamed to proxy.ts and the exported
 * function is renamed from `middleware` to `proxy`. The logic is identical.
 * Runs on the Node.js runtime (no Edge limitations).
 * 
 * Docs: https://nextjs.org/docs/app/guides/upgrading/version-16#middlewarets-renamed-to-proxysts
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole, ROLE_PORTAL_MAP } from '@/types';

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
];

/**
 * Decode role from token cookie (base64 JSON payload — full JWT verify in API routes)
 */
function getRoleFromToken(token: string): UserRole | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    const role = payload?.role as string;
    if (Object.values(UserRole).includes(role as UserRole)) {
      return role as UserRole;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * proxy — Next.js 16 renamed from `middleware`
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    // If already authenticated and hitting login, redirect to their portal
    if (pathname === '/login' || pathname === '/admin/login') {
      const token =
        request.cookies.get('auth_token')?.value ||
        request.cookies.get('admin_token')?.value;
      if (token) {
        const role = getRoleFromToken(token);
        if (role) {
          return NextResponse.redirect(new URL(ROLE_PORTAL_MAP[role], request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Check if route requires role protection
  const matchedPrefix = Object.keys(ROLE_PROTECTED_ROUTES).find(prefix =>
    pathname.startsWith(prefix)
  );

  if (matchedPrefix) {
    const token =
      request.cookies.get('auth_token')?.value ||
      request.cookies.get('admin_token')?.value ||
      (request.headers.get('authorization')?.startsWith('Bearer ')
        ? request.headers.get('authorization')!.substring(7)
        : null);

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = getRoleFromToken(token);
    const allowedRoles = ROLE_PROTECTED_ROUTES[matchedPrefix];

    if (!role || !allowedRoles.includes(role)) {
      if (role) {
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
