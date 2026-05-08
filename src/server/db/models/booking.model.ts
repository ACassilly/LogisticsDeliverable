import mongoose, { Document, Schema } from 'mongoose'

export enum BookingStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export interface IBooking extends Document {
  email: string
  pickup: { type: string; zip: string; city: string; state: string; street?: string; pickupDate: string; liftgateRequired?: boolean; insidePickup?: boolean; appointmentRequired?: boolean; }
  delivery: { type: string; zip: string; city: string; state: string; street?: string; liftgateRequired?: boolean; insideDelivery?: boolean; appointmentRequired?: boolean; notifyReceiverPriorToDelivery?: boolean; }
  items: { description: string; pieceCount: number; palletCount: number; weight: number; packageType: number; productClass: number; length?: number; width?: number; height?: number; nmfcNumber?: string; hazmat?: boolean; stackable?: boolean; protectFromFreezing?: boolean; }[]
  carrierName: string; carrierCode?: string; quoteId: string; totalRate: number;
  charges: { name: string; amount: number }[]
  transitDays?: string; estimatedDeliveryDate?: string; serviceType?: string;
  stripeSessionId: string; paymentIntentId?: string; status: BookingStatus;
  odooSaleOrderId?: number;
  createdAt: Date; updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    pickup: { type: { type: String, required: true }, zip: { type: String, required: true }, city: { type: String, required: true }, state: { type: String, required: true }, street: String, pickupDate: { type: String, required: true }, liftgateRequired: Boolean, insidePickup: Boolean, appointmentRequired: Boolean },
    delivery: { type: { type: String, required: true }, zip: { type: String, required: true }, city: { type: String, required: true }, state: { type: String, required: true }, street: String, liftgateRequired: Boolean, insideDelivery: Boolean, appointmentRequired: Boolean, notifyReceiverPriorToDelivery: Boolean },
    items: [{ description: { type: String, required: true }, pieceCount: { type: Number, required: true }, palletCount: { type: Number, required: true }, weight: { type: Number, required: true }, packageType: { type: Number, required: true }, productClass: { type: Number, required: true }, length: Number, width: Number, height: Number, nmfcNumber: String, hazmat: Boolean, stackable: Boolean, protectFromFreezing: Boolean }],
    carrierName: { type: String, required: true }, carrierCode: String, quoteId: { type: String, required: true }, totalRate: { type: Number, required: true },
    charges: [{ name: { type: String, required: true }, amount: { type: Number, required: true } }],
    transitDays: String, estimatedDeliveryDate: String, serviceType: String,
    stripeSessionId: { type: String, required: true, unique: true }, paymentIntentId: String, odooSaleOrderId: Number,
    status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.PENDING_PAYMENT, index: true },
  },
  { timestamps: true }
)
BookingSchema.index({ email: 1 })
export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
