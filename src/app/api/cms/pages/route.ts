import { NextRequest, NextResponse } from 'next/server';
import { getWebsitePages } from '@/lib/odoo-cms';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const websiteId = parseInt(searchParams.get('websiteId') || '8');

    const pages = await getWebsitePages(websiteId);

    return NextResponse.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pages',
      },
      { status: 500 }
    );
  }
}
