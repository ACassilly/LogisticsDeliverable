import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, validateRequest } from '@/server/middlewares';
import { registerSchema } from '@/server/validations';
import { registerUser } from '@/server/services';
import { generateToken } from '@/server/middlewares/auth';
import { ROLE_PORTAL_MAP, UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequest(request, registerSchema);
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 });
    const user = await registerUser(validation.data!);
    const token = generateToken({ id: user._id, email: user.email, role: user.role, name: user.name });
    const portalUrl = ROLE_PORTAL_MAP[UserRole.SHIPPER];
    return NextResponse.json({ success: true, data: { token, portalUrl, user: { id: user._id, email: user.email, name: user.name, role: user.role } }, message: 'Account created successfully' }, { status: 201 });
  } catch (error) { return handleApiError(error) }
}
