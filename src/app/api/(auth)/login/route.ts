import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, validateRequest } from '@/server/middlewares';
import { loginSchema } from '@/server/validations';
import { loginUser } from '@/server/services';
import { generateToken } from '@/server/middlewares/auth';
import { ROLE_PORTAL_MAP } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequest(request, loginSchema);
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 });
    const user = await loginUser(validation.data!);
    const token = generateToken({ id: user._id, email: user.email, role: user.role, name: user.name });
    const portalUrl = ROLE_PORTAL_MAP[user.role as keyof typeof ROLE_PORTAL_MAP] ?? '/login';
    return NextResponse.json({ success: true, data: { token, portalUrl, user: { id: user._id, email: user.email, name: user.name, role: user.role } }, message: 'Login successful' }, { status: 200 });
  } catch (error) { return handleApiError(error) }
}
