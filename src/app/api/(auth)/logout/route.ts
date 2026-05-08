import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiError } from '@/server/middlewares';

export async function POST(request: NextRequest) {
  try {
    const user = await withAuth(request);
    if (user) console.log(`User ${user.email} logged out at ${new Date().toISOString()}`);
    return NextResponse.json({ success: true, message: 'Logged out successfully' }, { status: 200 });
  } catch (error) { return handleApiError(error) }
}
