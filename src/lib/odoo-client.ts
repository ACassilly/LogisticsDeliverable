const ODOO_URL = process.env.ODOO_URL || 'https://id.portlandialogistics.com';
const ODOO_DB = process.env.ODOO_DB || 'portlandia';
const ODOO_USERNAME = process.env.ODOO_USERNAME || '';
const ODOO_API_KEY = process.env.ODOO_API_KEY || '';

async function jsonRpc(url: string, method: string, params: any): Promise<any> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params, id: Date.now() }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

async function call(service: string, method: string, args: any[]): Promise<any> {
  const url = `${ODOO_URL}/jsonrpc`;
  const params = {
    service,
    method,
    args,
  };
  return jsonRpc(url, 'call', params);
}

export async function authenticate(): Promise<number> {
  return await call('common', 'authenticate', [ODOO_DB, ODOO_USERNAME, ODOO_API_KEY, {}]);
}

export async function searchRead(model: string, domain: any[], fields: string[], uid: number): Promise<any[]> {
  return await call('object', 'execute_kw', [ODOO_DB, uid, ODOO_API_KEY, model, 'search_read', [domain], { fields }]);
}

export async function execute(model: string, method: string, args: any[], uid: number): Promise<any> {
  return await call('object', 'execute_kw', [ODOO_DB, uid, ODOO_API_KEY, model, method, args]);
}

export const PORTAL_GROUP_MAP: Record<string, string> = {
  SHIPPER: 'Client Portal',
  CARRIER: 'Contractor Portal',
  LEADERSHIP: 'Shareholder Portal',
  AGENT: 'Staff Portal',
  DISPATCHER: 'Staff Portal',
};