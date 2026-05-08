import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload { id: string; email: string; role?: string; name?: string; }
export interface AuthUser { id: string; email: string; role?: string; name?: string; }

function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  if (authHeader.startsWith('Bearer ')) return authHeader.substring(7);
  return authHeader;
}

function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return { id: decoded.id, email: decoded.email, role: decoded.role, name: decoded.name };
  } catch { return null; }
}

export async function withAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = extractToken(request);
  if (!token) return null;
  return verifyToken(token);
}

export function generateToken(payload: JWTPayload, expiresIn?: string | number): string {
  // @ts-expect-error - JWT library accepts both string and number for expiresIn
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d' });
}

export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'admin';
}

export async function withAdminAuth(request: NextRequest): Promise<AuthUser | null> {
  const user = await withAuth(request);
  if (!user || !isAdmin(user)) return null;
  return user;
}
