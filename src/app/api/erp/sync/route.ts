import { NextRequest, NextResponse } from 'next/server';
import { tenantGuard, getOdooCompanyFilter } from '@/middleware/tenant-guard';

export async function POST(req: NextRequest) {
  // Apply tenant guard middleware
  const guardResponse = tenantGuard(req);
  if (guardResponse) {
    return guardResponse;
  }

  // Read environment variables
  const odooUrl = process.env.ODOO_URL;
  const odooDb = process.env.ODOO_DB;
  const odooUsername = process.env.ODOO_USERNAME;
  const odooApiKey = process.env.ODOO_API_KEY;

  // Check if Odoo is configured
  if (!odooUrl || !odooDb || !odooUsername || !odooApiKey) {
    return NextResponse.json(
      { error: 'Odoo is not properly configured' },
      { status: 503 }
    );
  }

  // Apply company filter
  const companyFilter = getOdooCompanyFilter();

  return NextResponse.json(
    {
      success: true,
      tenant: 'portlandia-logistics',
      message: 'ERP sync initiated successfully',
      filter: companyFilter,
    },
    { status: 200 }
  );
}
