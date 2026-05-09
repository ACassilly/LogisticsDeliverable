/**
 * Odoo XML-RPC client
 * Connects to id.portlandialogistics.com Odoo instance
 * Used for: sale.order.create, res.partner lookup, freight quote → SO conversion
 */

const ODOO_URL = process.env.ODOO_URL || 'https://id.portlandialogistics.com';
const ODOO_DB = process.env.ODOO_DB || 'portlandia_logistics';
const ODOO_USERNAME = process.env.ODOO_USERNAME || '';
const ODOO_PASSWORD = process.env.ODOO_API_KEY || '';

/**
 * Raw XML-RPC call
 */
async function xmlRpcCall(
  endpoint: string,
  methodName: string,
  params: unknown[]
): Promise<unknown> {
  const body = `<?xml version="1.0"?>
<methodCall>
  <methodName>${methodName}</methodName>
  <params>
    ${params.map(serializeParam).join('\n    ')}
  </params>
</methodCall>`;

  const res = await fetch(`${ODOO_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/xml', 'Accept': 'text/xml' },
    body,
  });

  if (!res.ok) throw new Error(`Odoo XML-RPC HTTP error: ${res.status}`);
  const text = await res.text();
  return parseXmlRpcResponse(text);
}

/**
 * Authenticate and return Odoo UID
 */
let cachedUid: number | null = null;

export async function odooAuthenticate(): Promise<number> {
  if (cachedUid) return cachedUid;
  const uid = await xmlRpcCall('xmlrpc/2/common', 'authenticate', [
    ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD, {}
  ]) as number;
  if (!uid) throw new Error('Odoo authentication failed — check ODOO_USERNAME / ODOO_API_KEY');
  cachedUid = uid;
  return uid;
}

/**
 * Generic Odoo execute_kw call
 */
export async function odooExecute(
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown> = {}
): Promise<unknown> {
  const uid = await odooAuthenticate();
  return xmlRpcCall('xmlrpc/2/object', 'execute_kw', [
    ODOO_DB, uid, ODOO_PASSWORD,
    model, method, args, kwargs
  ]);
}

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------

/**
 * Create a Sale Order in Odoo from a GTZShip quote
 * Returns the new sale.order ID
 */
export async function createSaleOrder(params: {
  partnerEmail: string;
  partnerName: string;
  originZip: string;
  destZip: string;
  serviceType: string;  // 'ltl' | 'ftl' | 'intermodal' | 'drayage'
  carrierName?: string;
  totalAmount: number;
  quoteRef?: string;
  notes?: string;
}): Promise<number> {
  // 1. Find or create partner
  const partnerId = await findOrCreatePartner(params.partnerEmail, params.partnerName);

  // 2. Create the sale order
  const orderId = await odooExecute('sale.order', 'create', [{
    partner_id: partnerId,
    note: [
      `Quote Ref: ${params.quoteRef || 'N/A'}`,
      `Service: ${params.serviceType.toUpperCase()}`,
      `Origin ZIP: ${params.originZip} → Destination ZIP: ${params.destZip}`,
      params.carrierName ? `Carrier: ${params.carrierName}` : '',
      params.notes || '',
    ].filter(Boolean).join('\n'),
    order_line: [[
      0, 0, {
        name: `Freight - ${params.serviceType.toUpperCase()} | ${params.originZip} → ${params.destZip}`,
        product_uom_qty: 1,
        price_unit: params.totalAmount,
      }
    ]],
  }]) as number;

  return orderId;
}

/**
 * Find existing res.partner by email or create a new one
 */
export async function findOrCreatePartner(
  email: string,
  name: string
): Promise<number> {
  const existing = await odooExecute('res.partner', 'search_read',
    [[["email", "=", email]]],
    { fields: ['id'], limit: 1 }
  ) as Array<{ id: number }>;

  if (existing.length > 0) return existing[0].id;

  return await odooExecute('res.partner', 'create', [{ name, email }]) as number;
}

/**
 * Get sale orders for a partner email (for shipper portal)
 */
export async function getOrdersByEmail(email: string): Promise<unknown[]> {
  const partnerId = await findOrCreatePartner(email, '');
  return await odooExecute('sale.order', 'search_read',
    [[["partner_id", "=", partnerId]]],
    { fields: ['id', 'name', 'state', 'amount_total', 'date_order', 'note'], limit: 50 }
  ) as unknown[];
}

// ---------------------------------------------------------------------------
// Minimal XML-RPC serializer / parser
// ---------------------------------------------------------------------------

function serializeParam(value: unknown): string {
  if (typeof value === 'string') return `<param><value><string>${escXml(value)}</string></value></param>`;
  if (typeof value === 'number') return `<param><value><int>${value}</int></value></param>`;
  if (typeof value === 'boolean') return `<param><value><boolean>${value ? 1 : 0}</boolean></value></param>`;
  if (value === null || value === undefined) return `<param><value><nil/></value></param>`;
  if (Array.isArray(value)) {
    return `<param><value><array><data>${value.map(v =>
      `<value>${serializeValue(v)}</value>`).join('')}</data></array></value></param>`;
  }
  if (typeof value === 'object') {
    const members = Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      `<member><name>${escXml(k)}</name><value>${serializeValue(v)}</value></member>`
    ).join('');
    return `<param><value><struct>${members}</struct></value></param>`;
  }
  return `<param><value><string>${String(value)}</string></value></param>`;
}

function serializeValue(value: unknown): string {
  if (typeof value === 'string') return `<string>${escXml(value)}</string>`;
  if (typeof value === 'number') return Number.isInteger(value) ? `<int>${value}</int>` : `<double>${value}</double>`;
  if (typeof value === 'boolean') return `<boolean>${value ? 1 : 0}</boolean>`;
  if (value === null || value === undefined) return `<nil/>`;
  if (Array.isArray(value)) {
    return `<array><data>${value.map(v => `<value>${serializeValue(v)}</value>`).join('')}</data></array>`;
  }
  if (typeof value === 'object') {
    const members = Object.entries(value as Record<string, unknown>).map(([k, v]) =>
      `<member><name>${escXml(k)}</name><value>${serializeValue(v)}</value></member>`
    ).join('');
    return `<struct>${members}</struct>`;
  }
  return `<string>${String(value)}</string>`;
}

function escXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parseXmlRpcResponse(xml: string): unknown {
  // Check for fault
  if (xml.includes('<fault>')) {
    const match = xml.match(/<string>([^<]*)<\/string>/);
    throw new Error(`Odoo XML-RPC fault: ${match?.[1] || 'Unknown error'}`);
  }
  // Extract first value (simplified parser — full parsing handled by odoo-xmlrpc if needed)
  const intMatch = xml.match(/<int>(-?\d+)<\/int>/);
  if (intMatch) return parseInt(intMatch[1], 10);
  const boolMatch = xml.match(/<boolean>(\d)<\/boolean>/);
  if (boolMatch) return boolMatch[1] === '1';
  const strMatch = xml.match(/<string>([\s\S]*?)<\/string>/);
  if (strMatch) return strMatch[1];
  // For arrays/structs — return raw XML for further processing as needed
  return xml;
}
