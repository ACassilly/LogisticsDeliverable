/**
 * Odoo 19 JSON-RPC Service
 *
 * Handles all communication with the Odoo 19 backend via JSON-RPC protocol.
 * Uses API key authentication (more secure than password-based auth).
 *
 * Multi-Company Strategy:
 * - Resolves the target company ID dynamically by name (ODOO_COMPANY_NAME env var)
 * - Sets `company_id` on CRM leads and passes `allowed_company_ids` in context
 * - Ensures leads are routed to the correct child company (Portlandia Logistics LLC)
 *
 * @module odoo.service
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OdooConfig {
  url: string;
  db: string;
  username: string;
  apiKey: string;
  companyName: string;
}

interface OdooRPCResponse {
  jsonrpc: '2.0';
  id?: number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data: unknown;
  };
}

export interface CrmLeadInput {
  contactName: string;
  email: string;
  phone?: string;
  companyName?: string;
  city?: string;
  zip?: string;
  description: string;
}

export interface SaleOrderInput {
  email: string;
  pickup: {
    type: string;
    zip: string;
    city: string;
    state: string;
    street?: string;
    pickupDate: string;
    liftgateRequired?: boolean;
    insidePickup?: boolean;
    appointmentRequired?: boolean;
  };
  delivery: {
    type: string;
    zip: string;
    city: string;
    state: string;
    street?: string;
    liftgateRequired?: boolean;
    insideDelivery?: boolean;
    appointmentRequired?: boolean;
    notifyReceiverPriorToDelivery?: boolean;
  };
  items: {
    description: string;
    pieceCount: number;
    palletCount: number;
    weight: number;
    packageType: number;
    productClass: number;
    length?: number;
    width?: number;
    height?: number;
    nmfcNumber?: string;
    hazmat?: boolean;
    stackable?: boolean;
    protectFromFreezing?: boolean;
  }[];
  carrierName: string;
  carrierCode?: string;
  quoteId: string;
  totalRate: number;
  charges: { name: string; amount: number }[];
  transitDays?: string;
  estimatedDeliveryDate?: string;
  serviceType?: string;
  stripeSessionId: string;
  bookingId: string;
}

// ---------------------------------------------------------------------------
// Internal Odoo Client (singleton)
// ---------------------------------------------------------------------------

class OdooClient {
  private config: OdooConfig;
  private uid: number | null = null;
  private companyId: number | null = null;
  private freightProductId: number | null = null;
  private requestId = 1;

  constructor(config: OdooConfig) {
    this.config = config;
  }

  // -----------------------------------------------------------------------
  // Authentication
  // -----------------------------------------------------------------------

  /**
   * Authenticate with Odoo using the JSON-RPC `common` service.
   *
   * Uses `/jsonrpc` endpoint with `service: "common"`,
   * `method: "authenticate"`, which returns the numeric UID. The API key
   * is then passed in place of the password on every subsequent
   * `execute_kw` call — no session cookie needed.
   */
  async authenticate(): Promise<boolean> {
    try {
      console.log('[Odoo] Authenticating with', this.config.url);

      const endpoint = `${this.config.url}/jsonrpc`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'call',
          params: {
            service: 'common',
            method: 'authenticate',
            args: [this.config.db, this.config.username, this.config.apiKey, {}],
          },
          id: this.requestId++,
        }),
      });

      if (!response.ok) {
        console.error('[Odoo] HTTP error during authentication:', response.status);
        return false;
      }

      const data: OdooRPCResponse = await response.json();

      if (data.error) {
        console.error('[Odoo] Auth error:', data.error.message);
        return false;
      }

      const uid = data.result;
      if (typeof uid === 'number' && uid > 0) {
        this.uid = uid;
        console.log('[Odoo] Authenticated | UID:', this.uid);
        return true;
      }

      console.error('[Odoo] Auth failed — invalid credentials (uid:', uid, ')');
      return false;
    } catch (error) {
      console.error('[Odoo] Auth exception:', error);
      return false;
    }
  }

  // -----------------------------------------------------------------------
  // JSON-RPC call
  // -----------------------------------------------------------------------

  /**
   * Execute a method on an Odoo model via JSON-RPC `/jsonrpc` endpoint.
   * Automatically authenticates if no UID exists.
   */
  private async execute(
    model: string,
    method: string,
    args: unknown[] = [],
    kwargs: Record<string, unknown> = {},
  ): Promise<unknown> {
    if (!this.uid) {
      const ok = await this.authenticate();
      if (!ok) throw new Error('Failed to authenticate with Odoo');
    }

    const endpoint = `${this.config.url}/jsonrpc`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute_kw',
          args: [
            this.config.db,
            this.uid,
            this.config.apiKey,
            model,
            method,
            args,
            kwargs,
          ],
        },
        id: this.requestId++,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[Odoo] HTTP ${response.status}:`, text.substring(0, 300));
      throw new Error(`Odoo HTTP error: ${response.status}`);
    }

    const data: OdooRPCResponse = await response.json();

    if (data.error) {
      console.error('[Odoo] RPC Error:', data.error);
      throw new Error(
        typeof data.error.message === 'string'
          ? data.error.message
          : JSON.stringify(data.error),
      );
    }

    return data.result;
  }

  // -----------------------------------------------------------------------
  // Company resolution
  // -----------------------------------------------------------------------

  /**
   * Resolve the numeric `company_id` for the configured company name.
   * Caches the result so subsequent calls skip the RPC lookup.
   */
  async resolveCompanyId(): Promise<number> {
    if (this.companyId) return this.companyId;

    const companyName = this.config.companyName;
    if (!companyName) {
      throw new Error('ODOO_COMPANY_NAME is not configured');
    }

    console.log('[Odoo] Resolving company ID for:', companyName);

    const results = (await this.execute(
      'res.company',
      'search_read',
      [[['name', '=', companyName]]],
      { fields: ['id', 'name'], limit: 1 },
    )) as Array<{ id: number; name: string }>;

    if (!results || results.length === 0) {
      throw new Error(`Odoo company "${companyName}" not found`);
    }

    this.companyId = results[0].id;
    console.log('[Odoo] Company resolved:', companyName, '→ ID', this.companyId);
    return this.companyId;
  }

  // -----------------------------------------------------------------------
  // CRM Lead creation
  // -----------------------------------------------------------------------

  /**
   * Create a CRM lead in Odoo under the target company.
   *
   * Sets `type: "lead"` so it appears in CRM → Leads (not Opportunities).
   * Includes `company_id` and uses `allowed_company_ids` context to satisfy
   * Odoo's multi-company access rules.
   *
   * @returns The numeric Odoo lead ID, or null if creation failed.
   */
  async createLead(data: CrmLeadInput): Promise<number | null> {
    try {
      const companyId = await this.resolveCompanyId();

      const leadValues: Record<string, unknown> = {
        name: data.companyName
          ? `${data.contactName} — ${data.companyName}`
          : data.contactName,
        contact_name: data.contactName,
        email_from: data.email,
        phone: data.phone || false,
        partner_name: data.companyName || false,
        city: data.city || false,
        zip: data.zip || false,
        description: data.description,
        type: 'lead',
        company_id: companyId,
      };

      const leadId = await this.execute(
        'crm.lead',
        'create',
        [leadValues],
        { context: { allowed_company_ids: [companyId] } },
      );

      console.log('[Odoo] Lead created | ID:', leadId);
      return typeof leadId === 'number' ? leadId : null;
    } catch (error) {
      console.error('[Odoo] Failed to create lead:', error);
      return null;
    }
  }

  // -----------------------------------------------------------------------
  // Partner helpers
  // -----------------------------------------------------------------------

  /**
   * Find an existing partner by email, or create a new customer partner.
   */
  async findOrCreatePartner(
    email: string,
    companyId: number,
  ): Promise<number> {
    // Search by email
    const existing = (await this.execute(
      'res.partner',
      'search_read',
      [[['email', '=', email]]],
      { fields: ['id'], limit: 1 },
    )) as Array<{ id: number }>;

    if (existing && existing.length > 0) {
      return existing[0].id;
    }

    // Create new customer partner
    const partnerId = await this.execute(
      'res.partner',
      'create',
      [{
        name: email.split('@')[0],
        email,
        company_type: 'person',
        customer_rank: 1,
        company_id: companyId,
      }],
      { context: { allowed_company_ids: [companyId] } },
    );

    console.log('[Odoo] Partner created | ID:', partnerId);
    if (typeof partnerId !== 'number') {
      throw new Error('Failed to create partner in Odoo');
    }
    return partnerId;
  }

  // -----------------------------------------------------------------------
  // Product helpers
  // -----------------------------------------------------------------------

  /**
   * Find or create a generic "Freight Charge" service product.
   * Caches the product ID on the singleton instance.
   */
  async findOrCreateFreightProduct(companyId: number): Promise<number> {
    if (this.freightProductId) return this.freightProductId;

    const existing = (await this.execute(
      'product.product',
      'search_read',
      [[['name', '=', 'Freight Charge'], ['type', '=', 'service']]],
      { fields: ['id'], limit: 1 },
    )) as Array<{ id: number }>;

    if (existing && existing.length > 0) {
      this.freightProductId = existing[0].id;
      return this.freightProductId;
    }

    const productId = await this.execute(
      'product.product',
      'create',
      [{
        name: 'Freight Charge',
        type: 'service',
        list_price: 0,
        sale_ok: true,
        company_id: companyId,
        taxes_id: [[5, 0, 0]],
        supplier_taxes_id: [[5, 0, 0]],
      }],
      { context: { allowed_company_ids: [companyId] } },
    );

    console.log('[Odoo] Freight product created | ID:', productId);
    if (typeof productId !== 'number') {
      throw new Error('Failed to create freight product in Odoo');
    }
    this.freightProductId = productId;
    return productId;
  }

  // -----------------------------------------------------------------------
  // Sale Order creation
  // -----------------------------------------------------------------------

  /**
   * Create a confirmed Sale Order in Odoo for a paid booking.
   *
   * Steps:
   *  1. Find/create `res.partner` by email
   *  2. Find/create "Freight Charge" service product
   *  3. Build order lines from the charges array
   *  4. Create `sale.order` with all booking details in the internal note
   *  5. Confirm the order (`action_confirm` → state = 'sale')
   *
   * @returns The numeric Odoo sale order ID, or null if creation failed.
   */
  async createSaleOrder(data: SaleOrderInput): Promise<number | null> {
    try {
      const companyId = await this.resolveCompanyId();
      const partnerId = await this.findOrCreatePartner(data.email, companyId);
      const productId = await this.findOrCreateFreightProduct(companyId);

      // Build order lines from charges — Odoo one2many format: (0, 0, { ... })
      const orderLines = data.charges
        .filter((c) => c.amount > 0)
        .map((charge) => [
          0,
          0,
          {
            product_id: productId,
            name: charge.name || 'Freight Charge',
            product_uom_qty: 1,
            price_unit: charge.amount,
          },
        ]);

      // Fallback: if all charges were filtered out, use totalRate
      if (orderLines.length === 0) {
        orderLines.push([
          0,
          0,
          {
            product_id: productId,
            name: `Freight — ${data.carrierName}`,
            product_uom_qty: 1,
            price_unit: data.totalRate,
          },
        ]);
      }

      // Build accessorials list for pickup
      const pickupAccessorials: string[] = [];
      if (data.pickup.liftgateRequired) pickupAccessorials.push('Lift Gate Pickup');
      if (data.pickup.insidePickup) pickupAccessorials.push('Inside Pickup');
      if (data.pickup.appointmentRequired) pickupAccessorials.push('Appointment Pickup');

      // Build accessorials list for delivery
      const deliveryAccessorials: string[] = [];
      if (data.delivery.liftgateRequired) deliveryAccessorials.push('Lift Gate Delivery');
      if (data.delivery.insideDelivery) deliveryAccessorials.push('Inside Delivery');
      if (data.delivery.appointmentRequired) deliveryAccessorials.push('Appointment Delivery');
      if (data.delivery.notifyReceiverPriorToDelivery) deliveryAccessorials.push('Notify Prior to Arrival');

      // Build internal note with full shipment details
      const noteParts: string[] = [
        `=== Booking Reference ===${''  }`,
        `MongoDB Booking ID: ${data.bookingId}`,
        `Quote ID: ${data.quoteId}`,
        `Stripe Session: ${data.stripeSessionId}`,
        '',
        `=== Carrier ===${''  }`,
        `Carrier: ${data.carrierName}`,
        ...(data.carrierCode ? [`Carrier Code: ${data.carrierCode}`] : []),
        ...(data.serviceType ? [`Service Type: ${data.serviceType}`] : []),
        ...(data.transitDays ? [`Transit Days: ${data.transitDays}`] : []),
        ...(data.estimatedDeliveryDate ? [`Est. Delivery: ${data.estimatedDeliveryDate}`] : []),
        `Total Rate: $${data.totalRate.toFixed(2)}`,
        '',
        `=== Pickup ===${''  }`,
        `Type: ${data.pickup.type}`,
        `Address: ${data.pickup.street ? data.pickup.street + ', ' : ''}${data.pickup.city}, ${data.pickup.state} ${data.pickup.zip}`,
        `Pickup Date: ${data.pickup.pickupDate}`,
        ...(pickupAccessorials.length > 0 ? [`Accessorials: ${pickupAccessorials.join(', ')}`] : []),
        '',
        `=== Delivery ===${''  }`,
        `Type: ${data.delivery.type}`,
        `Address: ${data.delivery.street ? data.delivery.street + ', ' : ''}${data.delivery.city}, ${data.delivery.state} ${data.delivery.zip}`,
        ...(deliveryAccessorials.length > 0 ? [`Accessorials: ${deliveryAccessorials.join(', ')}`] : []),
        '',
        `=== Items (${data.items.length}) ===${''  }`,
        ...data.items.flatMap((item, idx) => [
          `Item ${idx + 1}: ${item.description}`,
          `  Pieces: ${item.pieceCount} | Pallets: ${item.palletCount} | Weight: ${item.weight} lbs`,
          `  Dimensions: ${item.length || 0}×${item.width || 0}×${item.height || 0} in`,
          `  Class: ${item.productClass} | Package Type: ${item.packageType}`,
          ...(item.nmfcNumber ? [`  NMFC: ${item.nmfcNumber}`] : []),
          ...(item.hazmat ? ['  ⚠ HAZMAT'] : []),
          ...(item.stackable ? ['  Stackable'] : []),
          ...(item.protectFromFreezing ? ['  Protect from Freezing'] : []),
        ]),
        '',
        `Submitted: ${new Date().toISOString()}`,
      ];

      const orderId = await this.execute(
        'sale.order',
        'create',
        [{
          partner_id: partnerId,
          company_id: companyId,
          client_order_ref: data.bookingId,
          order_line: orderLines,
          note: noteParts.join('\n'),
        }],
        { context: { allowed_company_ids: [companyId] } },
      );

      if (typeof orderId !== 'number') {
        console.error('[Odoo] sale.order create returned non-numeric ID:', orderId);
        return null;
      }

      // Confirm the order: draft → sale
      await this.execute(
        'sale.order',
        'action_confirm',
        [[orderId]],
        { context: { allowed_company_ids: [companyId] } },
      );

      console.log('[Odoo] Sale order created & confirmed | ID:', orderId);
      return orderId;
    } catch (error) {
      console.error('[Odoo] Failed to create sale order:', error);
      return null;
    }
  }

  /**
   * Simple connectivity check — authenticates and resolves the company.
   */
  async testConnection(): Promise<{
    authenticated: boolean;
    uid: number | null;
    companyId: number | null;
    companyName: string;
  }> {
    const authenticated = await this.authenticate();
    let resolvedCompanyId: number | null = null;

    if (authenticated) {
      try {
        resolvedCompanyId = await this.resolveCompanyId();
      } catch {
        // company resolution failed — still return partial result
      }
    }

    return {
      authenticated,
      uid: this.uid,
      companyId: resolvedCompanyId,
      companyName: this.config.companyName,
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton & env config
// ---------------------------------------------------------------------------

function getOdooConfig(): OdooConfig {
  const url = process.env.ODOO_URL;
  const db = process.env.ODOO_DB;
  const username = process.env.ODOO_USERNAME;
  const apiKey = process.env.ODOO_API_KEY;
  const companyName = process.env.ODOO_COMPANY_NAME || 'Portlandia Logistics LLC';

  if (!url || !db || !username || !apiKey) {
    throw new Error(
      'Missing Odoo environment variables. Required: ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_API_KEY',
    );
  }

  return {
    url: url.replace(/\/+$/, ''),
    db,
    username,
    apiKey,
    companyName,
  };
}

let client: OdooClient | null = null;

function getClient(): OdooClient {
  if (!client) {
    client = new OdooClient(getOdooConfig());
  }
  return client;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a CRM lead in Odoo for a contact form submission.
 */
export async function createCrmLead(data: CrmLeadInput): Promise<number | null> {
  return getClient().createLead(data);
}

/**
 * Create a confirmed Sale Order in Odoo for a paid freight booking.
 */
export async function createOdooSaleOrder(data: SaleOrderInput): Promise<number | null> {
  return getClient().createSaleOrder(data);
}

/**
 * Test Odoo connectivity — useful for health checks and the test script.
 */
export async function testOdooConnection() {
  return getClient().testConnection();
}
