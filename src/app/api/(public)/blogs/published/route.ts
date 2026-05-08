import { NextRequest, NextResponse } from 'next/server';
import { handleApiError, validateQueryParams } from '@/server/middlewares';
import { blogFiltersSchema } from '@/server/validations';
import { getPublishedBlogs, getBlogCategories, getPopularTags } from '@/server/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    if (searchParams.get('type') === 'categories') {
      const categories = await getBlogCategories();
      return NextResponse.json({ success: true, data: categories });
    }
    if (searchParams.get('type') === 'tags') {
      const limit = parseInt(searchParams.get('limit') || '20', 10);
      const tags = await getPopularTags(limit);
      return NextResponse.json({ success: true, data: tags });
    }
    const validation = validateQueryParams(request, blogFiltersSchema);
    if (!validation.success) return NextResponse.json(validation.error, { status: 400 });
    const result = await getPublishedBlogs(validation.data);
    return NextResponse.json({ success: true, data: result.blogs, pagination: result.pagination });
  } catch (error) { return handleApiError(error) }
}
