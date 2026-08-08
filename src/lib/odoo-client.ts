const ODOO_URL = process.env.ODOO_URL || 'https://id.portlandialogistics.com';
const ODOO_DB = process.env.ODOO_DB || 'pes_crm';
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
  return jsonApi(`${model}/read_group`, 'POST', payload);
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
  return jsonApi(`${model}/read`, 'POST', payload);
}

/**
 * Create a new record in Odoo model
 * Odoo 19 JSON-2 API uses vals_list (model_create_multi) for create
 */
export async function odooCreate(
  model: string,
  values: Record<string, any>
): Promise<number> {
  const payload = { vals_list: [values] };
  const result = await jsonApi(`${model}/create`, 'POST', payload);
  // JSON-2 create returns a list of IDs for model_create_multi
  if (Array.isArray(result)) {
    return result[0];
  }
  return result.id;
}

/**
 * Update records in Odoo model
 * Odoo 19 JSON-2 API uses vals (not values) for write
 */
export async function odooWrite(
  model: string,
  ids: number[],
  values: Record<string, any>
): Promise<boolean> {
  const payload = { vals: values };
  await jsonApi(`${model}/${ids.join(',')}/write`, 'POST', payload);
  return true;
}

export const PORTAL_GROUP_MAP: Record<string, string> = {
  SHIPPER: 'Client Portal',
  CARRIER: 'Contractor Portal',
  LEADERSHIP: 'Shareholder Portal',
  AGENT: 'Staff Portal',
  DISPATCHER: 'Staff Portal',
};