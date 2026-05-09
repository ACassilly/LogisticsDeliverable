/**
 * Email Service
 *
 * Sends OTP verification emails via Gmail SMTP using an App Password.
 * Requires in .env.local:
 *   GMAIL_USER=your-gmail@gmail.com
 *   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 */

import { createTransport } from 'nodemailer'

// ---------------------------------------------------------------------------
// Transporter (lazy singleton — created on first use)
// ---------------------------------------------------------------------------

let transporter: ReturnType<typeof createTransport> | null = null

function getTransporter() {
  if (!transporter) {
    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_APP_PASSWORD
    const host = process.env.GMAIL_HOST ?? 'smtp.gmail.com'
    const port = Number(process.env.GMAIL_PORT ?? 587)

    if (!user || !pass) {
      throw new Error(
        'Email service is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local'
      )
    }

    transporter = createTransport({
      host,
      port,
      // port 465 = implicit TLS (secure:true), port 587 = STARTTLS (secure:false)
      secure: port === 465,
      auth: { user, pass },
      tls: {
        // Accept self-signed certs in development; in production Gmail certs are always valid
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    })
  }
  return transporter
}

// ---------------------------------------------------------------------------
// HTML Template
// ---------------------------------------------------------------------------

function buildOtpEmailHtml(otp: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Verification Code – Portlandia Logistics</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0"
               style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a7a45 0%,#3BAB6B 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                Portlandia Logistics
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Freight &amp; Shipping Solutions
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#1a1a1a;">
                Verify Your Email
              </h2>
              <p style="margin:0 0 24px;font-size:15px;color:#444444;line-height:1.6;">
                Use the 6-digit code below to complete your freight booking.
                This code is valid for <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:28px 0;">
                    <div style="display:inline-block;background:#f0faf4;border:2px dashed #3BAB6B;border-radius:12px;padding:20px 40px;">
                      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#3BAB6B;text-transform:uppercase;letter-spacing:1.5px;">
                        Verification Code
                      </p>
                      <p style="margin:0;font-size:42px;font-weight:800;color:#1a7a45;letter-spacing:8px;font-family:'Courier New',monospace;">
                        ${otp}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#666666;line-height:1.6;">
                If you did not request this code, you can safely ignore this email.
                Someone may have entered your email address by mistake.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e8e8e8;margin:0 0 24px;" />

              <!-- Warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:6px;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;color:#7c5a00;line-height:1.5;">
                      <strong>Security reminder:</strong> Portlandia Logistics will never ask you
                      to share this code over the phone or via email. Keep it private.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8e8;">
              <p style="margin:0 0 8px;font-size:13px;color:#888888;">
                © ${new Date().getFullYear()} Portlandia Logistics · All rights reserved
              </p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                Need help? Call us at
                <a href="tel:+14794507010" style="color:#3BAB6B;text-decoration:none;">+1 479-450-7010</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendOtpEmail({ to, otp }: { to: string; otp: string }): Promise<void> {
  const transport = getTransporter()

  await transport.sendMail({
    from: process.env.GMAIL_FROM ?? `Portlandia Logistics <${process.env.GMAIL_USER}>`,
    to,
    subject: `${otp} is your Portlandia Logistics verification code`,
    html: buildOtpEmailHtml(otp),
    text: `Your Portlandia Logistics verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
  })
}

// ---------------------------------------------------------------------------
// Booking Confirmation Email
// ---------------------------------------------------------------------------

export interface BookingEmailData {
  email: string
  bookingId: string
  carrierName: string
  totalRate: number
  transitDays?: string
  estimatedDeliveryDate?: string
  serviceType?: string
  pickup: {
    city: string
    state: string
    zip: string
    pickupDate: string
  }
  delivery: {
    city: string
    state: string
    zip: string
  }
  items: {
    description: string
    weight: number
    productClass: number
    pieceCount: number
  }[]
  charges: { name: string; amount: number }[]
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatEmailDate(dateStr: string): string {
  if (!dateStr || dateStr === '0001-01-01T00:00:00') return '—'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function buildBookingConfirmationHtml(data: BookingEmailData): string {
  const chargeRows = data.charges
    .filter((c) => c.amount > 0)
    .map(
      (c) => `
        <tr>
          <td style="padding:8px 12px;font-size:14px;color:#444444;border-bottom:1px solid #f0f0f0;">${c.name}</td>
          <td style="padding:8px 12px;font-size:14px;color:#1a1a1a;text-align:right;border-bottom:1px solid #f0f0f0;font-weight:500;">$${formatCurrency(c.amount)}</td>
        </tr>`
    )
    .join('')

  const itemRows = data.items
    .map(
      (item, i) => `
        <tr>
          <td style="padding:8px 12px;font-size:14px;color:#444444;border-bottom:1px solid #f0f0f0;">${i + 1}. ${item.description}</td>
          <td style="padding:8px 12px;font-size:14px;color:#444444;text-align:right;border-bottom:1px solid #f0f0f0;">${item.weight} lbs</td>
          <td style="padding:8px 12px;font-size:14px;color:#444444;text-align:right;border-bottom:1px solid #f0f0f0;">Class ${item.productClass}</td>
          <td style="padding:8px 12px;font-size:14px;color:#444444;text-align:right;border-bottom:1px solid #f0f0f0;">${item.pieceCount} pc(s)</td>
        </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed – Portlandia Logistics</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0"
               style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a7a45 0%,#3BAB6B 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                Portlandia Logistics
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Freight &amp; Shipping Solutions
              </p>
            </td>
          </tr>

          <!-- Success Banner -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:24px 0;">
                    <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:#f0faf4;text-align:center;line-height:64px;font-size:32px;">
                      &#10003;
                    </div>
                    <h2 style="margin:16px 0 4px;font-size:24px;font-weight:700;color:#1a7a45;">
                      Booking Confirmed!
                    </h2>
                    <p style="margin:0;font-size:14px;color:#666666;">
                      Your freight shipment has been booked successfully.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Reference -->
          <tr>
            <td style="padding:0 40px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:16px 0;">
                    <div style="display:inline-block;background:#f0faf4;border:2px dashed #3BAB6B;border-radius:12px;padding:14px 32px;">
                      <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#3BAB6B;text-transform:uppercase;letter-spacing:1.5px;">
                        Booking Reference
                      </p>
                      <p style="margin:0;font-size:18px;font-weight:700;color:#1a7a45;font-family:'Courier New',monospace;letter-spacing:1px;">
                        ${data.bookingId}
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Route Summary -->
          <tr>
            <td style="padding:24px 40px 0;">
              <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.5px;">
                Route Summary
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:16px 20px;background:#f9fafb;border-bottom:1px solid #e8e8e8;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#3BAB6B;text-transform:uppercase;letter-spacing:1px;">From (Pickup)</p>
                    <p style="margin:0;font-size:15px;color:#1a1a1a;font-weight:500;">${data.pickup.city}, ${data.pickup.state} ${data.pickup.zip}</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#666666;">Pickup: ${formatEmailDate(data.pickup.pickupDate)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;background:#ffffff;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#3BAB6B;text-transform:uppercase;letter-spacing:1px;">To (Delivery)</p>
                    <p style="margin:0;font-size:15px;color:#1a1a1a;font-weight:500;">${data.delivery.city}, ${data.delivery.state} ${data.delivery.zip}</p>
                    ${data.estimatedDeliveryDate ? `<p style="margin:4px 0 0;font-size:13px;color:#666666;">Est. Delivery: ${formatEmailDate(data.estimatedDeliveryDate)}</p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Carrier Details -->
          <tr>
            <td style="padding:24px 40px 0;">
              <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.5px;">
                Carrier &amp; Service
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 20px;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:13px;color:#666666;">Carrier</span><br/>
                    <span style="font-size:15px;font-weight:500;color:#1a1a1a;">${data.carrierName}</span>
                  </td>
                </tr>
                ${data.serviceType ? `<tr>
                  <td style="padding:12px 20px;border-bottom:1px solid #f0f0f0;">
                    <span style="font-size:13px;color:#666666;">Service Type</span><br/>
                    <span style="font-size:15px;font-weight:500;color:#1a1a1a;">${data.serviceType}</span>
                  </td>
                </tr>` : ''}
                ${data.transitDays ? `<tr>
                  <td style="padding:12px 20px;">
                    <span style="font-size:13px;color:#666666;">Transit Time</span><br/>
                    <span style="font-size:15px;font-weight:500;color:#1a1a1a;">${data.transitDays} business days</span>
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:24px 40px 0;">
              <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.5px;">
                Shipment Items
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 12px;font-size:12px;color:#666666;text-align:left;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
                  <th style="padding:10px 12px;font-size:12px;color:#666666;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Weight</th>
                  <th style="padding:10px 12px;font-size:12px;color:#666666;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Class</th>
                  <th style="padding:10px 12px;font-size:12px;color:#666666;text-align:right;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
                </tr>
                ${itemRows}
              </table>
            </td>
          </tr>

          <!-- Charges & Total -->
          <tr>
            <td style="padding:24px 40px 0;">
              <h3 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.5px;">
                Payment Summary
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;">
                ${chargeRows}
                <tr style="background:#f0faf4;">
                  <td style="padding:12px 12px;font-size:16px;color:#1a7a45;font-weight:700;">Total Paid</td>
                  <td style="padding:12px 12px;font-size:16px;color:#1a7a45;text-align:right;font-weight:700;">$${formatCurrency(data.totalRate)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding:28px 40px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:#f0faf4;border-left:4px solid #3BAB6B;border-radius:6px;padding:16px 18px;">
                    <p style="margin:0 0 6px;font-size:14px;font-weight:600;color:#1a7a45;">What&rsquo;s Next?</p>
                    <p style="margin:0;font-size:13px;color:#444444;line-height:1.6;">
                      Our team will coordinate pickup with the carrier. You&rsquo;ll receive tracking updates as your shipment progresses. Keep your booking reference handy for any inquiries.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:24px 40px;text-align:center;border-top:1px solid #e8e8e8;margin-top:32px;">
              <p style="margin:0 0 8px;font-size:13px;color:#888888;">
                &copy; ${new Date().getFullYear()} Portlandia Logistics &middot; All rights reserved
              </p>
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                Need help? Call us at
                <a href="tel:+14794507010" style="color:#3BAB6B;text-decoration:none;">+1 479-450-7010</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<void> {
  const transport = getTransporter()

  const totalWeight = data.items.reduce((sum, item) => sum + item.weight, 0)

  await transport.sendMail({
    from: process.env.GMAIL_FROM ?? `Portlandia Logistics <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: `Booking Confirmed — ${data.pickup.city}, ${data.pickup.state} → ${data.delivery.city}, ${data.delivery.state} | ${totalWeight} lbs`,
    html: buildBookingConfirmationHtml(data),
    text: [
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
    ].filter(Boolean).join('\n'),
  })
}
