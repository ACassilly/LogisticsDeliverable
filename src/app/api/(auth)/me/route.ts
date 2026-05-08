import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiError } from '@/server/middlewares';
import { getUserById } from '@/server/services';

export async function GET(request: NextRequest) {
  try {
    const authUser = await withAuth(request);
    if (!authUser) return NextResponse.json({ success: false, error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
    const user = await getUserById(authUser.id);
    if (!user) return NextResponse.json({ success: false, error: 'Not Found', message: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: { id: user._id, email: user.email, name: user.name, role: user.role, lastLogin: user.lastLogin } });
  } catch (error) { return handleApiError(error) }
}
