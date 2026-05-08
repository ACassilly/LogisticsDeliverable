import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiError, validateRequest } from '@/server/middlewares';
import { updateBlogSchema } from '@/server/validations';
import { getBlogById, updateBlog, deleteBlog } from '@/server/services';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await withAuth(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
    const { id } = await params;
    const blog = await getBlogById(id);
    return NextResponse.json({ success: true, data: blog });
  } catch (error) { return handleApiError(error) }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await withAuth(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
    const { id } = await params;
    const validation = await validateRequest(request, updateBlogSchema);
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 });
    const blog = await updateBlog(id, validation.data!);
    return NextResponse.json({ success: true, data: blog, message: 'Blog updated successfully' });
  } catch (error) { return handleApiError(error) }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await withAuth(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
    const { id } = await params;
    await deleteBlog(id);
    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) { return handleApiError(error) }
}
