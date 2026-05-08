import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiError, validateRequest } from '@/server/middlewares';
import { createUserByAdminSchema } from '@/server/validations';
import { createUserByAdmin, listUsers } from '@/server/services';
import { UserRole } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authUser = await withAuth(request);
    if (!authUser || authUser.role !== UserRole.ADMIN) return NextResponse.json({ success: false, error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role') ?? undefined;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
    const result = await listUsers({ role: roleFilter, page, limit });
    return NextResponse.json({ success: true, ...result });
  } catch (error) { return handleApiError(error) }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await withAuth(request);
    if (!authUser || authUser.role !== UserRole.ADMIN) return NextResponse.json({ success: false, error: 'Forbidden', message: 'Admin access required' }, { status: 403 });
    const validation = await validateRequest(request, createUserByAdminSchema);
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 });
    const user = await createUserByAdmin(validation.data!);
    return NextResponse.json({ success: true, data: { id: user._id, email: user.email, name: user.name, role: user.role, companyName: user.companyName, isActive: user.isActive, createdAt: user.createdAt }, message: `${user.role} account created successfully` }, { status: 201 });
  } catch (error) { return handleApiError(error) }
}
