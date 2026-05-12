import { NextRequest, NextResponse } from 'next/server';
import { getOdooPageContent } from '@/lib/odoo-cms';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const pageId = parseInt(id);

    if (isNaN(pageId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid page ID',
        },
        { status: 400 }
      );
    }

    const content = await getOdooPageContent(pageId);

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Page content not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: pageId,
        html: content,
      },
    });
  } catch (error) {
    console.error('Error fetching page content:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch page content',
      },
      { status: 500 }
    );
  }
}
