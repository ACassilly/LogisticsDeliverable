import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_TENANT = 'portlandia-logistics';

/**
 * Tenant guard middleware that locks ERP access to portlandia-logistics only.
 * Checks the x-tenant-id header and returns 403 if not the allowed tenant.
 */
export function tenantGuard(req: NextRequest): NextResponse | null {
  const tenantId = req.headers.get('x-tenant-id');

  if (tenantId !== ALLOWED_TENANT) {
    return NextResponse.json(
      { error: 'Unauthorized tenant access' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Get Odoo company filter for the allowed tenant.
 * Returns a filter array for restricting queries to company_id 1.
 */
export function getOdooCompanyFilter() {
  return [['company_id', 'in', [1]]];
}
