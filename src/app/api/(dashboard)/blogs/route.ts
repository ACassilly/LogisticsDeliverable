import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleApiError, validateRequest, validateQueryParams } from '@/server/middlewares';
import { createBlogSchema, createDraftBlogSchema, blogFiltersSchema } from '@/server/validations';
import { getAllBlogs, createBlog } from '@/server/services';

export async function GET(request: NextRequest) {
  try {
    const user = await withAuth(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
    const validation = validateQueryParams(request, blogFiltersSchema);
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 });
    const result = await getAllBlogs(validation.data);
    return NextResponse.json({ success: true, data: result.blogs, pagination: result.pagination });
  } catch (error) { return handleApiError(error) }
}

export async function POST(request: NextRequest) {
  try {
    const user = await withAuth(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized', message: 'Authentication required' }, { status: 401 });
    const body = await request.json();
    const isDraft = body.published === false || !body.published;
    const requestWithBody = { json: async () => body } as NextRequest;
    const schema = isDraft ? createDraftBlogSchema : createBlogSchema;
    const validation = await validateRequest(requestWithBody, schema);
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 });
    const blog = await createBlog(validation.data!);
    return NextResponse.json({ success: true, data: blog, message: isDraft ? 'Draft saved successfully' : 'Blog created successfully' }, { status: 201 });
  } catch (error) { return handleApiError(error) }
}
