const ODOO_URL = process.env.ODOO_URL || 'https://id.portlandialogistics.com';
const ODOO_DB = process.env.ODOO_DB || 'portlandia_logistics';
const ODOO_API_KEY = process.env.ODOO_API_KEY || '';

/**
 * Make a request to Odoo 19's JSON-2 API endpoint
 */
async function jsonApi(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  payload?: any
): Promise<any> {
  const url = `${ODOO_URL}/json/2/${endpoint}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ODOO_API_KEY}`,
    'X-Odoo-Database': ODOO_DB,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Odoo API error (${response.status}): ${error}`);
  }

  return response.json();
}

/**
 * Search and read records from Odoo model
 */
export async function odooSearchRead(
  model: string,
  domain: any[] = [],
  fields: string[] = []
): Promise<any[]> {
  const payload = {
    domain,
    fields: fields.length > 0 ? fields : undefined,
  };
  return jsonApi(`model/${model}/read_group`, 'POST', payload);
}

/**
 * Read specific records by IDs
 */
export async function odooRead(
  model: string,
  ids: number[],
  fields: string[] = []
): Promise<any[]> {
  const payload = {
    ids,
    fields: fields.length > 0 ? fields : undefined,
  };
  return jsonApi(`model/${model}/read`, 'POST', payload);
}

/**
 * Create a new record in Odoo model
 */
export async function odooCreate(
  model: string,
  values: Record<string, any>
): Promise<number> {
  const payload = { values };
  const result = await jsonApi(`model/${model}/create`, 'POST', payload);
  return result.id;
}

/**
 * Update records in Odoo model
 */
export async function odooWrite(
  model: string,
  ids: number[],
  values: Record<string, any>
): Promise<boolean> {
  const payload = { ids, values };
  await jsonApi(`model/${model}/write`, 'POST', payload);
  return true;
}

export const PORTAL_GROUP_MAP: Record<string, string> = {
  SHIPPER: 'Client Portal',
  CARRIER: 'Contractor Portal',
  LEADERSHIP: 'Shareholder Portal',
  AGENT: 'Staff Portal',
  DISPATCHER: 'Staff Portal',
};