import { NextRequest, NextResponse } from 'next/server';
import { getCompanyInfo } from '@/lib/odoo-cms';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = parseInt(searchParams.get('companyId') || '3');

    const company = await getCompanyInfo(companyId);

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch company info',
      },
      { status: 500 }
    );
  }
}
