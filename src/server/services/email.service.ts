/**
 * Email service — Portlandia Logistics
 *
 * Uses Microsoft Graph app-only sendMail when GRAPH_MAIL_* env vars are set.
 * Falls back to nodemailer/Gmail SMTP when only GMAIL_* are set (dev).
 *
 * Required env for Graph path:
 *   GRAPH_MAIL_TENANT_ID
 *   GRAPH_MAIL_CLIENT_ID
 *   GRAPH_MAIL_CLIENT_SECRET
 *   GRAPH_MAIL_SENDER            e.g. operations@portlandiaelectric.supply
 *   GMAIL_FROM                   friendly from header (optional)
 *
 * Required env for legacy SMTP path:
 *   GMAIL_USER
 *   GMAIL_APP_PASSWORD
 *   GMAIL_FROM                   (optional)
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// -----------------------------------------------------------------------------
// Graph app-only token cache
// -----------------------------------------------------------------------------

interface CachedToken {
  token: string
  expiresAt: number
}

let cachedToken: CachedToken | null = null

async function getGraphToken(): Promise<string> {
  const tenantId = process.env.GRAPH_MAIL_TENANT_ID
  const clientId = process.env.GRAPH_MAIL_CLIENT_ID
  const clientSecret = process.env.GRAPH_MAIL_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Graph mail is not configured. Set GRAPH_MAIL_TENANT_ID, GRAPH_MAIL_CLIENT_ID, GRAPH_MAIL_CLIENT_SECRET.'
    )
  }

  // Reuse cached token if it has more than 5 min of life left
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: 'https://graph.microsoft.com/.default',
  })

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    { method: 'POST', body: params }
  )

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`[Graph] token endpoint returned ${res.status}: ${text.slice(0, 300)}`)
  }

  const json = (await res.json()) as { access_token: string; expires_in: number }
  if (!json.access_token) {
    throw new Error('[Graph] token response missing access_token')
  }

  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  }
  return cachedToken.token
}

interface GraphSendMailArgs {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  fromName?: string
}

async function graphSendMail({ to, subject, html, text, fromName }: GraphSendMailArgs): Promise<void> {
  const sender = process.env.GRAPH_MAIL_SENDER
  if (!sender) {
    throw new Error('GRAPH_MAIL_SENDER env var is required to send via Graph.')
  }

  const token = await getGraphToken()
  const toList = Array.isArray(to) ? to : [to]

  const body = {
    message: {
      subject,
      body: html
        ? { contentType: 'HTML', content: html }
        : { contentType: 'Text', content: text ?? '' },
      toRecipients: toList.map((addr) => ({ emailAddress: { address: addr } })),
      ...(fromName
        ? { from: { emailAddress: { address: sender, name: fromName } } }
        : {}),
    },
    saveToSentItems: true,
  }

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  if (res.status !== 202) {
    const bodyText = await res.text().catch(() => '')
    throw new Error(`[Graph] sendMail returned ${res.status}: ${bodyText.slice(0, 400)}`)
  }
}

function useGraph(): boolean {
  return !!(
    process.env.GRAPH_MAIL_TENANT_ID &&
    process.env.GRAPH_MAIL_CLIENT_ID &&
    process.env.GRAPH_MAIL_CLIENT_SECRET &&
    process.env.GRAPH_MAIL_SENDER
  )
}

// -----------------------------------------------------------------------------
// Legacy SMTP transporter (used only if GRAPH_MAIL_* is not configured)
// -----------------------------------------------------------------------------

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (transporter) return transporter

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) {
    throw new Error(
      'Email service is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local'
    )
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
  return transporter
}

function friendlyFrom(): string {
  return (
    process.env.GMAIL_FROM ??
    `Portlandia Logistics <${process.env.GRAPH_MAIL_SENDER ?? process.env.GMAIL_USER ?? 'noreply@portlandialogistics.com'}>`
  )
}

// -----------------------------------------------------------------------------
// Public API
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
</html>`
}

export async function sendOtpEmail({ to, otp }: { to: string; otp: string }): Promise<void> {
  const subject = `Your Portlandia Logistics verification code: ${otp}`
  const html = buildOtpHtml(otp)
  const text = `Your Portlandia Logistics verification code is: ${otp}\n\nThis code expires in 10 minutes.`

  if (useGraph()) {
    await graphSendMail({ to, subject, html, text, fromName: 'Portlandia Logistics' })
    return
  }

  await getTransporter().sendMail({
    from: friendlyFrom(),
    to,
    subject,
    html,
    text,
  })
}

// -----------------------------------------------------------------------------
// Booking confirmation
// -----------------------------------------------------------------------------

interface BookingEmailData {
  email: string
  bookingId: string
  carrierName: string
  totalRate: number
  transitDays?: string | number
  estimatedDeliveryDate?: string
  serviceType?: string
  pickup: { city: string; state: string; zip: string; pickupDate: string }
  delivery: { city: string; state: string; zip: string }
  items: Array<{ description: string; weight: number; productClass: number | string; pieceCount: number }>
  charges: Array<{ name: string; amount: number }>
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function buildBookingConfirmationHtml(data: BookingEmailData): string {
  const totalWeight = data.items.reduce((sum, item) => sum + item.weight, 0)
  const rows = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.pieceCount} × ${item.description}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${item.weight} lbs</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">Class ${item.productClass}</td>
        </tr>`
    )
    .join('')

  const chargeRows = data.charges
    .map(
      (c) => `
        <tr>
          <td style="padding:6px 12px;color:#555;">${c.name}</td>
          <td style="padding:6px 12px;text-align:right;color:#555;">$${formatCurrency(c.amount)}</td>
        </tr>`
    )
    .join('')

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
</html>`
}

export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<void> {
  const totalWeight = data.items.reduce((sum, item) => sum + item.weight, 0)
  const subject = `Booking Confirmed — ${data.pickup.city}, ${data.pickup.state} → ${data.delivery.city}, ${data.delivery.state} | ${totalWeight} lbs`
  const html = buildBookingConfirmationHtml(data)
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
    .join('\n')

  if (useGraph()) {
    await graphSendMail({ to: data.email, subject, html, text, fromName: 'Portlandia Logistics' })
    return
  }

  await getTransporter().sendMail({
    from: friendlyFrom(),
    to: data.email,
    subject,
    html,
    text,
  })
}
