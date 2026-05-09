"use client"

import { Button } from "@/components/ui/button"
import type { AllCarrierRate } from "@/types/quote.types"

interface CarrierRateCardProps {
  rate: AllCarrierRate
  pickupDate: string
  onSelect: (quoteId: string) => void
}

export function CarrierRateCard({ rate, pickupDate, onSelect }: CarrierRateCardProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-[#E0E0E0] p-4 sm:p-5 md:p-6 hover:border-[--brand-primary]/30 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
            <h3 className="font-syne text-lg sm:text-xl md:text-2xl font-bold text-[--text-primary]">
              {rate.carrierName}
            </h3>
          </div>
          {rate.serviceType && (
            <p className="font-poppins text-xs text-[#666666]">{rate.serviceType}</p>
          )}
        </div>
        {rate.onTimePercentage && (
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-poppins font-medium bg-[#E8F5ED] text-[--brand-primary]">
            {rate.onTimePercentage}% On-Time
          </span>
        )}
      </div>

      {/* Transit Timeline */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex-shrink-0">
            <p className="font-poppins text-xs text-[#666666] mb-1">Pickup</p>
            <p className="font-poppins text-sm font-semibold text-[--text-primary]">
              {pickupDate}
            </p>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <p className="font-poppins text-xs text-[#666666] mb-1">
              {rate.transitDays} day{rate.transitDays !== "1" ? "s" : ""}
            </p>
            <div className="border-t-2 border-dashed border-[#E0E0E0] w-full"></div>
          </div>

          <div className="flex-shrink-0">
            <p className="font-poppins text-xs text-[#666666] mb-1">Est. Delivery</p>
            <p className="font-poppins text-sm font-semibold text-[--text-primary]">
              {rate.estimatedDeliveryDate ?? "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Charge Breakdown */}
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        {rate.charges.map((charge, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="font-poppins text-xs sm:text-sm text-[#666666]">{charge.name}</span>
            <span className="font-poppins text-xs sm:text-sm font-semibold text-[--text-primary]">
              ${charge.amount.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="pt-2 sm:pt-3 border-t border-[#E0E0E0] flex justify-between items-center">
          <span className="font-poppins text-sm sm:text-base font-semibold text-[--text-primary]">
            Total
          </span>
          <span className="font-poppins text-lg sm:text-xl font-bold text-[--brand-primary]">
            ${rate.totalRate.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Guaranteed Rate (if available) */}
      {rate.guaranteedRate && (
        <div className="mb-4 sm:mb-6 p-3 rounded-lg bg-[#FFFDE7] border border-[#FFF176]">
          <p className="font-poppins text-xs font-semibold text-[#F9A825] mb-1">
            Guaranteed: {rate.guaranteedRate.name}
          </p>
          <p className="font-poppins text-sm font-bold text-[--text-primary]">
            ${parseFloat(rate.guaranteedRate.amount).toFixed(2)}{" "}
            <span className="text-xs font-normal text-[#666666]">
              ({rate.guaranteedRate.serviceDays} day{rate.guaranteedRate.serviceDays !== "1" ? "s" : ""})
            </span>
          </p>
        </div>
      )}

      {/* Select Button */}
      <Button
        onClick={() => onSelect(rate.quoteId)}
        className="w-full h-10 sm:h-12 btn-gradient-green text-white font-poppins font-semibold text-sm sm:text-base rounded-full hover:opacity-90"
      >
        Select Rate
      </Button>
    </div>
  )
}
