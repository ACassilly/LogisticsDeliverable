"use client"

import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react"
import type { AllCarrierRate } from "@/types/quote.types"
import type { PaymentStatus } from "@/store"

interface PaymentStepProps {
  rate: AllCarrierRate | null
  pickupDate: string
  email: string
  paymentStatus: PaymentStatus
  isPaying: boolean
  isVerifyingPayment?: boolean
  payError?: string | null
  onPay: () => void
  onSubmitBooking: () => void
}

export function PaymentStep({
  rate,
  pickupDate,
  email,
  paymentStatus,
  isPaying,
  isVerifyingPayment,
  payError,
  onPay,
  onSubmitBooking,
}: PaymentStepProps) {
  if (!rate) {
    return (
      <div className="text-center py-12">
        <p className="text-[#666666] font-poppins">No carrier rate selected.</p>
      </div>
    )
  }

  const isPaymentDone = paymentStatus === "success"
  const isCancelled = paymentStatus === "cancelled"
  const isFailed = paymentStatus === "failed"

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      {/* Title */}
      <div className="mb-6 sm:mb-8">
        <h2 className="font-syne text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[--text-primary] mb-2">
          Payment Summary
        </h2>
        <p className="font-poppins text-sm sm:text-base text-[#666666]">
          Review your selected carrier and proceed to payment
        </p>
      </div>

      {/* Payment status banners */}
      {isVerifyingPayment && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-300 rounded-xl p-4 mb-6">
          <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 animate-spin" />
          <p className="font-poppins text-sm text-blue-800">
            Confirming your payment and saving your booking&hellip; Please do not close this page.
          </p>
        </div>
      )}
      {isCancelled && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="font-poppins text-sm text-amber-800">
            Payment was cancelled. You can try again when you&apos;re ready.
          </p>
        </div>
      )}
      {isFailed && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="font-poppins text-sm text-red-800">
            Payment failed. Please try again or use a different payment method.
          </p>
        </div>
      )}
      {payError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-300 rounded-xl p-4 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="font-poppins text-sm text-red-800">{payError}</p>
        </div>
      )}
      {isPaymentDone && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-xl p-4 mb-6">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="font-poppins text-sm text-green-800">
            Payment successful! Click &quot;Submit Booking&quot; to finalize your order.
          </p>
        </div>
      )}

      {/* Carrier Details Card */}
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-[#E0E0E0] p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
        {/* Carrier Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-[#E0E0E0] gap-4">
          <div>
            <h3 className="font-syne text-lg sm:text-xl md:text-2xl font-bold text-[--text-primary] mb-2 sm:mb-3">
              {rate.carrierName}
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {rate.serviceType && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-poppins font-medium bg-[#E8F5ED] text-[--brand-primary]">
                  {rate.serviceType}
                </span>
              )}
              {rate.transitDays && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-poppins font-medium bg-blue-50 text-blue-700">
                  {rate.transitDays} Transit Days
                </span>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="font-syne text-2xl sm:text-3xl font-bold text-[--brand-primary]">
              ${rate.totalRate.toFixed(2)}
            </div>
            <div className="font-poppins text-xs sm:text-sm text-[#666666] mt-1">Total Cost</div>
          </div>
        </div>

        {/* Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <div className="font-poppins text-xs sm:text-sm text-[#999999] mb-1">Pickup Date</div>
            <div className="font-poppins text-base sm:text-lg font-semibold text-[--text-primary]">
              {pickupDate || "—"}
            </div>
          </div>
          {rate.estimatedDeliveryDate && (
            <div>
              <div className="font-poppins text-xs sm:text-sm text-[#999999] mb-1">Est. Delivery</div>
              <div className="font-poppins text-base sm:text-lg font-semibold text-[--text-primary]">
                {rate.estimatedDeliveryDate}
              </div>
            </div>
          )}
          <div>
            <div className="font-poppins text-xs sm:text-sm text-[#999999] mb-1">Email</div>
            <div className="font-poppins text-sm sm:text-base font-medium text-[--text-primary]">
              {email}
            </div>
          </div>
          {rate.onTimePercentage && (
            <div>
              <div className="font-poppins text-xs sm:text-sm text-[#999999] mb-1">On-Time Rate</div>
              <div className="font-poppins text-sm sm:text-base font-medium text-[--text-primary]">
                {rate.onTimePercentage}%
              </div>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="border-t border-[#E0E0E0] pt-4 sm:pt-6">
          <h4 className="font-syne text-base sm:text-lg font-bold text-[--text-primary] mb-3 sm:mb-4">
            Cost Breakdown
          </h4>
          <div className="space-y-2 sm:space-y-3">
            {rate.charges.map((charge, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="font-poppins text-sm sm:text-base text-[#666666]">{charge.name}</span>
                <span className="font-poppins text-sm sm:text-base font-medium text-[--text-primary]">
                  ${charge.amount.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 sm:pt-3 border-t-2 border-[#E0E0E0]">
              <span className="font-syne text-base sm:text-lg md:text-xl font-bold text-[--text-primary]">Total</span>
              <span className="font-syne text-base sm:text-lg md:text-xl font-bold text-[--brand-primary]">
                ${rate.totalRate.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment CTA */}
      {!isPaymentDone && !isVerifyingPayment && (
        <div className="bg-gradient-to-r from-[#E8F5ED] to-[#F0F9F4] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 border border-[#C8E6D7]">
          <div className="text-center">
            <h3 className="font-syne text-lg sm:text-xl md:text-2xl font-bold text-[--text-primary] mb-2 sm:mb-3">
              Ready to Complete Your Booking? 🚚
            </h3>
            <p className="font-poppins text-sm sm:text-base text-[#666666] mb-3 sm:mb-4">
              Your shipment details have been confirmed. Click below to proceed with secure
              payment and finalize your booking.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-poppins text-[#666666]">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[--brand-primary]" />
              <span>Secure Payment via Stripe</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center">
        {isPaymentDone ? (
          <Button
            type="button"
            onClick={onSubmitBooking}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 h-auto text-base sm:text-lg btn-gradient-green text-white font-poppins font-semibold rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
          >
            Submit Booking
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onPay}
            disabled={isPaying || isVerifyingPayment}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 h-auto text-base sm:text-lg btn-gradient-green text-white font-poppins font-semibold rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
          >
            {isPaying ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing…
              </span>
            ) : isVerifyingPayment ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying…
              </span>
            ) : (
              `Pay $${rate.totalRate.toFixed(2)}`
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
