import Booking, { BookingStatus, type IBooking } from '@/server/db/models/booking.model'
import { connectDB } from '@/server/db'

export interface CreateBookingData {
  email: string; pickup: IBooking['pickup']; delivery: IBooking['delivery']; items: IBooking['items'];
  carrierName: string; carrierCode?: string; quoteId: string; totalRate: number;
  charges: { name: string; amount: number }[];
  transitDays?: string; estimatedDeliveryDate?: string; serviceType?: string; stripeSessionId: string;
}

export async function createBooking(data: CreateBookingData): Promise<IBooking> {
  await connectDB()
  return Booking.create({ ...data, status: BookingStatus.PENDING_PAYMENT })
}

export async function updateBookingPayment(stripeSessionId: string, paymentIntentId: string | null, status: BookingStatus): Promise<IBooking | null> {
  await connectDB()
  return Booking.findOneAndUpdate({ stripeSessionId }, { ...(paymentIntentId ? { paymentIntentId } : {}), status }, { returnDocument: 'after' })
}

export async function getBookingByStripeSession(stripeSessionId: string): Promise<IBooking | null> {
  await connectDB()
  return Booking.findOne({ stripeSessionId })
}

export async function getBookingById(id: string): Promise<IBooking | null> {
  await connectDB()
  return Booking.findById(id)
}

export async function updateBookingOdooId(bookingId: string, odooSaleOrderId: number): Promise<IBooking | null> {
  await connectDB()
  return Booking.findByIdAndUpdate(bookingId, { odooSaleOrderId }, { returnDocument: 'after' })
}
