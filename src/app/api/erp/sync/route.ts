import { NextRequest, NextResponse } from 'next/server';
import { tenantGuard, getOdooCompanyFilter } from '@/middleware/tenant-guard';
import { odooSearchRead } from '@/lib/odoo-client';

export async function POST(req: NextRequest) {
  // Apply tenant guard middleware
  const guardResponse = tenantGuard(req);
  if (guardResponse) {
    return guardResponse;
  }

  try {
    // Get company filter and extract company ID
    const companyFilter = getOdooCompanyFilter();
    const companyId = companyFilter[0][2][0];

    // Search and read res.partner records
    const partners = await odooSearchRead('res.partner', [['company_id', '=', companyId]], ['name', 'email', 'phone']);

    return NextResponse.json({ partners });
  } catch (error) {
    console.error('ERP sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with ERP' },
      { status: 500 }
    );
  }
}
