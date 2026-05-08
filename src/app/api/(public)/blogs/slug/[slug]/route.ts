import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/server/middlewares';
import { getBlogBySlug } from '@/server/services';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug, true);
    return NextResponse.json({ success: true, data: blog });
  } catch (error) { return handleApiError(error) }
}
