import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteMenus } from '@/lib/odoo-cms';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const websiteId = parseInt(searchParams.get('websiteId') || '8');

    const menus = await getWebsiteMenus(websiteId);

    return NextResponse.json({
      success: true,
      data: menus,
    });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch menus',
      },
      { status: 500 }
    );
  }
}
