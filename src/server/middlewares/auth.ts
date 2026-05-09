import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * JWT Secret from environment variables
 */
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('⚠️  Warning: JWT_SECRET is not set or using default value. Please set it in .env.local');
}

/**
 * User payload interface
 */
export interface JWTPayload {
  id: string;
  email: string;
  role?: string;
  name?: string;
}

/**
 * Authenticated user interface
 */
export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  name?: string;
}

/**
 * Extract JWT token from Authorization header
 * 
 * @param request - Next.js request object
 * @returns Token string or null
 */
function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Return the full header value if not in Bearer format
  return authHeader;
}

/**
 * Verify JWT token and extract user data
 * 
 * @param token - JWT token string
 * @returns User data or null if invalid
 */
function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('Invalid JWT token:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired:', error.message);
    } else {
      console.error('JWT verification error:', error);
    }
    return null;
  }
}


export async function withAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = extractToken(request);
  
  if (!token) {
    return null;
  }
  
  const user = verifyToken(token);
  
  return user;
}

/**
 * Generate JWT token for a user
 * Useful for authentication endpoints
 * 
 * @param payload - User data to encode in token
 * @param expiresIn - Token expiration (default: 7d)
 * @returns JWT token string
 */
export function generateToken(
  payload: JWTPayload,
  expiresIn?: string | number
): string {
  // TypeScript has strict typing for JWT expiresIn, but runtime accepts string | number
  // @ts-expect-error - JWT library accepts both string and number for expiresIn despite type definition
  return jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Check if user has admin role
 * 
 * @param user - Authenticated user
 * @returns True if user is admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN' || user?.role === 'admin';
}

/**
 * Middleware to check admin role
 * 
 * @param request - Next.js request object
 * @returns User data if admin, null otherwise
 */
export async function withAdminAuth(request: NextRequest): Promise<AuthUser | null> {
  const user = await withAuth(request);
  
  if (!user || !isAdmin(user)) {
    return null;
  }
  
  return user;
}

