/**
 * Email service — Portlandia Logistics
 *
 * DEFECT-10: Replaces Microsoft Graph sendMail + nodemailer/Gmail fallback
 * with the Riven Mail endpoint (auth-provisioner email service).
 *
 *   POST {RIVEN_MAIL_URL}/emails/send
 *   Header: x-internal-auth: <secret>
 *   Body:   { to, subject, html, fields: { from_name, from_email } }
 *   Resp:   { ok: true, smtp: "..." }
 *
 * The internal secret is read from the Docker secret mounted at
 * `/run/secrets/riven-auth-provisioner-internal-secret`, falling back to the
 * `RIVEN_AUTH_PROVISIONER_SECRET` env var.
 *
 * Env vars:
 *   RIVEN_MAIL_URL                    (default: http://riven-platform_riven-auth-provisioner:8420)
 *   RIVEN_AUTH_PROVISIONER_SECRET     (or the Docker secret file)
 *   RIVEN_MAIL_FROM_EMAIL             sender address (default: noreply@portlandialogistics.com)
 *   RIVEN_MAIL_FROM_NAME              sender display name (default: Portlandia Logistics)
 */

import { readFileSync } from 'node:fs';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

function getMailUrl(): string {
  return (
    process.env.RIVEN_MAIL_URL || 'http://riven-platform_riven-auth-provisioner:8420'
  ).replace(/\/$/, '');
}

const SECRET_FILE = '/run/secrets/riven-auth-provisioner-internal-secret';

/**
 * Resolve the internal auth secret. Reads the Docker secret file first, then
 * falls back to the env var. Cached after first read.
 */
let cachedSecret: string | undefined;
function getInternalSecret(): string {
  if (cachedSecret !== undefined) return cachedSecret;
  // Try the Docker secret file.
  try {
    const fileSecret = readFileSync(SECRET_FILE, 'utf8').trim();
    if (fileSecret) {
      cachedSecret = fileSecret;
      return cachedSecret;
    }
  } catch {
    // File not present (e.g. local dev) — fall through to env var.
  }
  cachedSecret = process.env.RIVEN_AUTH_PROVISIONER_SECRET || '';
  return cachedSecret;
}

function getFromEmail(): string {
  return process.env.RIVEN_MAIL_FROM_EMAIL || 'noreply@portlandialogistics.com';
}

function getFromName(): string {
  return process.env.RIVEN_MAIL_FROM_NAME || 'Portlandia Logistics';
}

/**
 * Whether the Riven Mail service is configured (secret present). Used by the
 * OTP route to decide whether to attempt sending.
 */
export function isEmailConfigured(): boolean {
  return getInternalSecret().length > 0;
}

// -----------------------------------------------------------------------------
// Public send primitive
// -----------------------------------------------------------------------------

interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
}

/**
 * Send an email through the Riven Mail (auth-provisioner) endpoint.
 *
 * Accepts `{ ok: true, smtp: "..." }` as a success response.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  fromName,
}: SendEmailArgs): Promise<void> {
  const secret = getInternalSecret();
  if (!secret) {
    throw new Error(
      'Riven Mail is not configured. Set RIVEN_AUTH_PROVISIONER_SECRET or mount the riven-auth-provisioner-internal-secret Docker secret.'
    );
  }

  const toList = Array.isArray(to) ? to : [to];
  const fromNameResolved = fromName ?? getFromName();

  const body = {
    to: toList,
    subject,
    html: html ?? text ?? '',
    fields: {
      from_name: fromNameResolved,
      from_email: getFromEmail(),
    },
  };

  const res = await fetch(`${getMailUrl()}/emails/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-auth': secret,
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`[Riven Mail] /emails/send returned ${res.status}: ${text.slice(0, 400)}`);
  }

  // Accept `{ ok: true, smtp: "..." }` as success. Non-JSON 2xx is also fine.
  try {
    const data = (await res.json()) as { ok?: boolean; smtp?: string };
    if (data && data.ok === false) {
      throw new Error(`[Riven Mail] send reported failure: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    // If the body wasn't JSON but the status was 2xx, treat as success.
    if (err instanceof SyntaxError) return;
    throw err;
  }
}

// -----------------------------------------------------------------------------
// OTP email
// -----------------------------------------------------------------------------

function buildOtpHtml(otp: string): string {
  return `<!doctype html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f6;padding:24px;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <tr>
      <td style="padding:32px 40px 16px;text-align:center;">
        <h1 style="margin:0;color:#111;font-size:22px;">Verify your email</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 40px 24px;text-align:center;color:#444;font-size:15px;line-height:1.5;">
        Enter this six-digit code to finish your Portlandia Logistics quote:
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 32px;text-align:center;">
        <div style="display:inline-block;font-family:'SF Mono',Menlo,Consolas,monospace;font-size:32px;letter-spacing:0.35em;padding:16px 24px;background:#f0f6ff;color:#0b3d91;border-radius:8px;font-weight:600;">${otp}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 24px;text-align:center;color:#888;font-size:13px;line-height:1.5;">
        This code expires in 10 minutes. If you didn't request it, you can ignore this message.
      </td>
    </tr>
    <tr>
      <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e8e8e8;">
        <p style="margin:0;font-size:12px;color:#aaa;">© ${new Date().getFullYear()} Portlandia Logistics</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmail({ to, otp }: { to: string; otp: string }): Promise<void> {
  const subject = `Your Portlandia Logistics verification code: ${otp}`;
  const html = buildOtpHtml(otp);
  const text = `Your Portlandia Logistics verification code is: ${otp}\n\nThis code expires in 10 minutes.`;

  await sendEmail({ to, subject, html, text, fromName: 'Portlandia Logistics' });
}

// -----------------------------------------------------------------------------
// Booking confirmation
// -----------------------------------------------------------------------------

interface BookingEmailData {
  email: string;
  bookingId: string;
  carrierName: string;
  totalRate: number;
  transitDays?: string | number;
  estimatedDeliveryDate?: string;
  serviceType?: string;
  pickup: { city: string; state: string; zip: string; pickupDate: string };
  delivery: { city: string; state: string; zip: string };
  items: Array<{ description: string; weight: number; productClass: number | string; pieceCount: number }>;
  charges: Array<{ name: string; amount: number }>;
}

export type { BookingEmailData };

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildBookingConfirmationHtml(data: BookingEmailData): string {
  const totalWeight = data.items.reduce((sum, item) => sum + item.weight, 0);
  const rows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.pieceCount} × ${item.description}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${item.weight} lbs</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">Class ${item.productClass}</td>
        </tr>`
    )
    .join('');

  const chargeRows = data.charges
    .map(
      (c) => `
        <tr>
          <td style="padding:6px 12px;color:#555;">${c.name}</td>
          <td style="padding:6px 12px;text-align:right;color:#555;">$${formatCurrency(c.amount)}</td>
        </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f6;padding:24px;margin:0;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <tr>
      <td style="background:#0b3d91;padding:24px 40px;color:#fff;">
        <h1 style="margin:0;font-size:22px;">Booking confirmed</h1>
        <p style="margin:6px 0 0;font-size:14px;color:#c7d6ff;">Reference #${data.bookingId}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px;">
        <p style="margin:0 0 16px;font-size:15px;color:#333;">Thanks for booking with Portlandia Logistics. Here are the details:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#666;">Route</td>
            <td style="padding:8px 0;font-size:14px;text-align:right;">${data.pickup.city}, ${data.pickup.state} ${data.pickup.zip} → ${data.delivery.city}, ${data.delivery.state} ${data.delivery.zip}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#666;">Pickup date</td>
            <td style="padding:8px 0;font-size:14px;text-align:right;">${data.pickup.pickupDate}</td>
          </tr>
          ${data.transitDays ? `<tr><td style="padding:8px 0;font-size:14px;color:#666;">Transit</td><td style="padding:8px 0;font-size:14px;text-align:right;">${data.transitDays} business days</td></tr>` : ''}
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#666;">Carrier</td>
            <td style="padding:8px 0;font-size:14px;text-align:right;">${data.carrierName}</td>
          </tr>
        </table>

        <h3 style="margin:24px 0 8px;font-size:15px;color:#111;">Freight</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #eee;">
          ${rows}
          <tr>
            <td style="padding:10px 12px;font-weight:600;">Total weight</td>
            <td style="padding:10px 12px;text-align:right;font-weight:600;" colspan="2">${totalWeight} lbs</td>
          </tr>
        </table>

        <h3 style="margin:24px 0 8px;font-size:15px;color:#111;">Charges</h3>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
          ${chargeRows}
          <tr>
            <td style="padding:10px 12px;border-top:1px solid #eee;font-weight:600;font-size:16px;">Total</td>
            <td style="padding:10px 12px;border-top:1px solid #eee;text-align:right;font-weight:600;font-size:16px;">$${formatCurrency(data.totalRate)}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#f8f9fa;padding:20px 40px;text-align:center;border-top:1px solid #e8e8e8;">
        <p style="margin:0 0 6px;font-size:13px;color:#888;">© ${new Date().getFullYear()} Portlandia Logistics</p>
        <p style="margin:0;font-size:12px;color:#aaa;">Need help? Call <a href="tel:+14794507010" style="color:#3BAB6B;text-decoration:none;">+1 479-450-7010</a></p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<void> {
  const totalWeight = data.items.reduce((sum, item) => sum + item.weight, 0);
  const subject = `Booking Confirmed — ${data.pickup.city}, ${data.pickup.state} → ${data.delivery.city}, ${data.delivery.state} | ${totalWeight} lbs`;
  const html = buildBookingConfirmationHtml(data);
  const text = [
    `Booking Confirmed!`,
    ``,
    `Reference: ${data.bookingId}`,
    `Route: ${data.pickup.city}, ${data.pickup.state} ${data.pickup.zip} → ${data.delivery.city}, ${data.delivery.state} ${data.delivery.zip}`,
    `Carrier: ${data.carrierName}`,
    `Total: $${formatCurrency(data.totalRate)}`,
    `Pickup Date: ${data.pickup.pickupDate}`,
    data.transitDays ? `Transit: ${data.transitDays} business days` : '',
    ``,
    `Thank you for choosing Portlandia Logistics!`,
    `Need help? Call +1 479-450-7010`,
  ]
    .filter(Boolean)
    .join('\n');

  await sendEmail({ to: data.email, subject, html, text, fromName: 'Portlandia Logistics' });
}
