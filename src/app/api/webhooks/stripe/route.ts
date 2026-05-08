import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/server/services/stripe.service'
import { updateBookingPayment, getBookingByStripeSession, updateBookingOdooId } from '@/server/services/booking.service'
import { BookingStatus } from '@/server/db/models/booking.model'
import { createOdooSaleOrder } from '@/server/services/odoo.service'
import { sendBookingConfirmationEmail } from '@/server/services/email.service'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature')
    if (!signature) return NextResponse.json({ success: false, error: 'Missing stripe-signature header' }, { status: 400 })
    const body = await request.text()
    let event
    try { event = constructWebhookEvent(body, signature) } catch { return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 400 }) }
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const stripeSessionId = session.id
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null
        await updateBookingPayment(stripeSessionId, paymentIntentId, BookingStatus.PAID)
        const booking = await getBookingByStripeSession(stripeSessionId)
        if (booking && !booking.odooSaleOrderId) {
          ;(async () => {
            try {
              const saleOrderId = await createOdooSaleOrder({ email: booking.email, pickup: booking.pickup, delivery: booking.delivery, items: booking.items.map((item) => ({ description: item.description, pieceCount: item.pieceCount, palletCount: item.palletCount, weight: item.weight, packageType: item.packageType, productClass: item.productClass, length: item.length, width: item.width, height: item.height, nmfcNumber: item.nmfcNumber, hazmat: item.hazmat, stackable: item.stackable, protectFromFreezing: item.protectFromFreezing })), carrierName: booking.carrierName, carrierCode: booking.carrierCode, quoteId: booking.quoteId, totalRate: booking.totalRate, charges: booking.charges.map((c) => ({ name: c.name, amount: c.amount })), transitDays: booking.transitDays, estimatedDeliveryDate: booking.estimatedDeliveryDate, serviceType: booking.serviceType, stripeSessionId, bookingId: booking._id!.toString() })
              if (saleOrderId) await updateBookingOdooId(booking._id!.toString(), saleOrderId)
            } catch (err) { console.error('[Webhook] Odoo sale order creation failed (non-blocking):', err) }
          })()
          sendBookingConfirmationEmail({ email: booking.email, bookingId: booking._id!.toString(), carrierName: booking.carrierName, totalRate: booking.totalRate, transitDays: booking.transitDays, estimatedDeliveryDate: booking.estimatedDeliveryDate, serviceType: booking.serviceType, pickup: { city: booking.pickup.city, state: booking.pickup.state, zip: booking.pickup.zip, pickupDate: booking.pickup.pickupDate }, delivery: { city: booking.delivery.city, state: booking.delivery.state, zip: booking.delivery.zip }, items: booking.items.map((item) => ({ description: item.description, weight: item.weight, productClass: item.productClass, pieceCount: item.pieceCount })), charges: booking.charges.map((c) => ({ name: c.name, amount: c.amount })) }).catch((err) => { console.error('[Webhook] Booking confirmation email failed (non-blocking):', err) })
        }
        break
      }
      case 'checkout.session.expired': {
        const session = event.data.object
        await updateBookingPayment(session.id, null, BookingStatus.EXPIRED)
        break
      }
      default: break
    }
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ success: false, error: 'Webhook handler failed' }, { status: 500 })
  }
}
