interface OdooConfig { url: string; db: string; username: string; apiKey: string; companyName: string }
interface OdooRPCResponse { jsonrpc: '2.0'; id?: number; result?: unknown; error?: { code: number; message: string; data: unknown } }

export interface CrmLeadInput { contactName: string; email: string; phone?: string; companyName?: string; city?: string; zip?: string; description: string }

export interface SaleOrderInput {
  email: string;
  pickup: { type: string; zip: string; city: string; state: string; street?: string; pickupDate: string; liftgateRequired?: boolean; insidePickup?: boolean; appointmentRequired?: boolean };
  delivery: { type: string; zip: string; city: string; state: string; street?: string; liftgateRequired?: boolean; insideDelivery?: boolean; appointmentRequired?: boolean; notifyReceiverPriorToDelivery?: boolean };
  items: { description: string; pieceCount: number; palletCount: number; weight: number; packageType: number; productClass: number; length?: number; width?: number; height?: number; nmfcNumber?: string; hazmat?: boolean; stackable?: boolean; protectFromFreezing?: boolean }[];
  carrierName: string; carrierCode?: string; quoteId: string; totalRate: number; charges: { name: string; amount: number }[];
  transitDays?: string; estimatedDeliveryDate?: string; serviceType?: string; stripeSessionId: string; bookingId: string;
}

class OdooClient {
  private config: OdooConfig;
  private uid: number | null = null;
  private companyId: number | null = null;
  private freightProductId: number | null = null;
  private requestId = 1;

  constructor(config: OdooConfig) { this.config = config }

  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.url}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service: 'common', method: 'authenticate', args: [this.config.db, this.config.username, this.config.apiKey, {}] }, id: this.requestId++ }) })
      if (!response.ok) return false
      const data: OdooRPCResponse = await response.json()
      if (data.error) { console.error('[Odoo] Auth error:', data.error.message); return false }
      const uid = data.result
      if (typeof uid === 'number' && uid > 0) { this.uid = uid; return true }
      return false
    } catch (error) { console.error('[Odoo] Auth exception:', error); return false }
  }

  private async execute(model: string, method: string, args: unknown[] = [], kwargs: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.uid) { const ok = await this.authenticate(); if (!ok) throw new Error('Failed to authenticate with Odoo') }
    const response = await fetch(`${this.config.url}/jsonrpc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { service: 'object', method: 'execute_kw', args: [this.config.db, this.uid, this.config.apiKey, model, method, args, kwargs] }, id: this.requestId++ }) })
    if (!response.ok) { const text = await response.text(); throw new Error(`Odoo HTTP error: ${response.status}: ${text.substring(0, 300)}`) }
    const data: OdooRPCResponse = await response.json()
    if (data.error) throw new Error(typeof data.error.message === 'string' ? data.error.message : JSON.stringify(data.error))
    return data.result
  }

  async resolveCompanyId(): Promise<number> {
    if (this.companyId) return this.companyId
    const results = (await this.execute('res.company', 'search_read', [[['name', '=', this.config.companyName]]], { fields: ['id', 'name'], limit: 1 })) as Array<{ id: number; name: string }>
    if (!results || results.length === 0) throw new Error(`Odoo company "${this.config.companyName}" not found`)
    this.companyId = results[0].id
    return this.companyId
  }

  async createLead(data: CrmLeadInput): Promise<number | null> {
    try {
      const companyId = await this.resolveCompanyId()
      const leadValues: Record<string, unknown> = { name: data.companyName ? `${data.contactName} — ${data.companyName}` : data.contactName, contact_name: data.contactName, email_from: data.email, phone: data.phone || false, partner_name: data.companyName || false, city: data.city || false, zip: data.zip || false, description: data.description, type: 'lead', company_id: companyId }
      const leadId = await this.execute('crm.lead', 'create', [leadValues], { context: { allowed_company_ids: [companyId] } })
      return typeof leadId === 'number' ? leadId : null
    } catch (error) { console.error('[Odoo] Failed to create lead:', error); return null }
  }

  async findOrCreatePartner(email: string, companyId: number): Promise<number> {
    const existing = (await this.execute('res.partner', 'search_read', [[['email', '=', email]]], { fields: ['id'], limit: 1 })) as Array<{ id: number }>
    if (existing && existing.length > 0) return existing[0].id
    const partnerId = await this.execute('res.partner', 'create', [{ name: email.split('@')[0], email, company_type: 'person', customer_rank: 1, company_id: companyId }], { context: { allowed_company_ids: [companyId] } })
    if (typeof partnerId !== 'number') throw new Error('Failed to create partner in Odoo')
    return partnerId
  }

  async findOrCreateFreightProduct(companyId: number): Promise<number> {
    if (this.freightProductId) return this.freightProductId
    const existing = (await this.execute('product.product', 'search_read', [[['name', '=', 'Freight Charge'], ['type', '=', 'service']]], { fields: ['id'], limit: 1 })) as Array<{ id: number }>
    if (existing && existing.length > 0) { this.freightProductId = existing[0].id; return this.freightProductId }
    const productId = await this.execute('product.product', 'create', [{ name: 'Freight Charge', type: 'service', list_price: 0, sale_ok: true, company_id: companyId, taxes_id: [[5, 0, 0]], supplier_taxes_id: [[5, 0, 0]] }], { context: { allowed_company_ids: [companyId] } })
    if (typeof productId !== 'number') throw new Error('Failed to create freight product in Odoo')
    this.freightProductId = productId
    return productId
  }

  async createSaleOrder(data: SaleOrderInput): Promise<number | null> {
    try {
      const companyId = await this.resolveCompanyId()
      const partnerId = await this.findOrCreatePartner(data.email, companyId)
      const productId = await this.findOrCreateFreightProduct(companyId)
      const orderLines = data.charges.filter((c) => c.amount > 0).map((charge) => [0, 0, { product_id: productId, name: charge.name || 'Freight Charge', product_uom_qty: 1, price_unit: charge.amount }])
      if (orderLines.length === 0) orderLines.push([0, 0, { product_id: productId, name: `Freight — ${data.carrierName}`, product_uom_qty: 1, price_unit: data.totalRate }])
      const pickupAcc = [data.pickup.liftgateRequired && 'Lift Gate Pickup', data.pickup.insidePickup && 'Inside Pickup', data.pickup.appointmentRequired && 'Appointment Pickup'].filter(Boolean)
      const deliveryAcc = [data.delivery.liftgateRequired && 'Lift Gate Delivery', data.delivery.insideDelivery && 'Inside Delivery', data.delivery.appointmentRequired && 'Appointment Delivery', data.delivery.notifyReceiverPriorToDelivery && 'Notify Prior to Arrival'].filter(Boolean)
      const noteParts = [`=== Booking Reference ===`, `MongoDB Booking ID: ${data.bookingId}`, `Quote ID: ${data.quoteId}`, `Stripe Session: ${data.stripeSessionId}`, '', `=== Carrier ===`, `Carrier: ${data.carrierName}`, ...(data.carrierCode ? [`Carrier Code: ${data.carrierCode}`] : []), ...(data.serviceType ? [`Service Type: ${data.serviceType}`] : []), ...(data.transitDays ? [`Transit Days: ${data.transitDays}`] : []), ...(data.estimatedDeliveryDate ? [`Est. Delivery: ${data.estimatedDeliveryDate}`] : []), `Total Rate: $${data.totalRate.toFixed(2)}`, '', `=== Pickup ===`, `Type: ${data.pickup.type}`, `Address: ${data.pickup.street ? data.pickup.street + ', ' : ''}${data.pickup.city}, ${data.pickup.state} ${data.pickup.zip}`, `Pickup Date: ${data.pickup.pickupDate}`, ...(pickupAcc.length > 0 ? [`Accessorials: ${pickupAcc.join(', ')}`] : []), '', `=== Delivery ===`, `Type: ${data.delivery.type}`, `Address: ${data.delivery.street ? data.delivery.street + ', ' : ''}${data.delivery.city}, ${data.delivery.state} ${data.delivery.zip}`, ...(deliveryAcc.length > 0 ? [`Accessorials: ${deliveryAcc.join(', ')}`] : []), '', `=== Items (${data.items.length}) ===`, ...data.items.flatMap((item, idx) => [`Item ${idx + 1}: ${item.description}`, `  Pieces: ${item.pieceCount} | Pallets: ${item.palletCount} | Weight: ${item.weight} lbs`, `  Dimensions: ${item.length || 0}x${item.width || 0}x${item.height || 0} in`, `  Class: ${item.productClass} | Package Type: ${item.packageType}`, ...(item.nmfcNumber ? [`  NMFC: ${item.nmfcNumber}`] : []), ...(item.hazmat ? ['  HAZMAT'] : []), ...(item.stackable ? ['  Stackable'] : []), ...(item.protectFromFreezing ? ['  Protect from Freezing'] : [])]), '', `Submitted: ${new Date().toISOString()}`]
      const orderId = await this.execute('sale.order', 'create', [{ partner_id: partnerId, company_id: companyId, client_order_ref: data.bookingId, order_line: orderLines, note: noteParts.join('\n') }], { context: { allowed_company_ids: [companyId] } })
      if (typeof orderId !== 'number') return null
      await this.execute('sale.order', 'action_confirm', [[orderId]], { context: { allowed_company_ids: [companyId] } })
      console.log('[Odoo] Sale order created & confirmed | ID:', orderId)
      return orderId
    } catch (error) { console.error('[Odoo] Failed to create sale order:', error); return null }
  }

  async testConnection() {
    const authenticated = await this.authenticate()
    let resolvedCompanyId: number | null = null
    if (authenticated) { try { resolvedCompanyId = await this.resolveCompanyId() } catch {} }
    return { authenticated, uid: this.uid, companyId: resolvedCompanyId, companyName: this.config.companyName }
  }
}

function getOdooConfig(): OdooConfig {
  const url = process.env.ODOO_URL; const db = process.env.ODOO_DB; const username = process.env.ODOO_USERNAME; const apiKey = process.env.ODOO_API_KEY; const companyName = process.env.ODOO_COMPANY_NAME || 'Portlandia Logistics LLC'
  if (!url || !db || !username || !apiKey) throw new Error('Missing Odoo environment variables. Required: ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_API_KEY')
  return { url: url.replace(/\/+$/, ''), db, username, apiKey, companyName }
}

let client: OdooClient | null = null
function getClient(): OdooClient { if (!client) { client = new OdooClient(getOdooConfig()) } return client }

export async function createCrmLead(data: CrmLeadInput): Promise<number | null> { return getClient().createLead(data) }
export async function createOdooSaleOrder(data: SaleOrderInput): Promise<number | null> { return getClient().createSaleOrder(data) }
export async function testOdooConnection() { return getClient().testConnection() }
