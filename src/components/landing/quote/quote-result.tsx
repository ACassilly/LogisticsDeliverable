"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import Link from "next/link"
import { BookingDialog } from "./booking-dialog"
import type { QuoteRateResult } from "@/types"
import type { QuoteFormData } from "@/validations/quote.validation"

interface QuoteResultProps {
  lowestCost: QuoteRateResult | null
  quickestTransit: QuoteRateResult | null
  formData: QuoteFormData
  onEdit: () => void
}

/** Format a date string for display */
function formatDisplayDate(dateStr?: string): string {
  if (!dateStr || dateStr === "0001-01-01T00:00:00") return "--"
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    return `${days[date.getDay()]}, ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
  } catch {
    return dateStr
  }
}

/** Format dollar amount for display */
function formatRate(amount: string): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function QuoteResult({ lowestCost, quickestTransit, formData, onEdit }: QuoteResultProps) {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedRate, setSelectedRate] = useState<"lowest" | "quickest">("lowest")

  // Use lowest cost as primary, fall back to quickest transit
  const hasAlternative = lowestCost && quickestTransit && lowestCost.quoteId !== quickestTransit.quoteId
  const displayRate = selectedRate === "lowest" ? (lowestCost ?? quickestTransit) : (quickestTransit ?? lowestCost)

  if (!displayRate) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border-2 border-dashed border-[#E0E0E0] mt-4 text-center">
        <h2 className="font-syne text-2xl sm:text-3xl font-bold text-[--text-primary] mb-3">
          No Rates Available
        </h2>
        <p className="text-[#666666] text-sm mb-6">
          We couldn&apos;t find rates for the specified shipment details. Please adjust your shipment information and try again.
        </p>
        <Button onClick={onEdit} className="btn-gradient-green text-white rounded-[35px] px-8 h-12">
          Edit Quote
        </Button>
      </div>
    )
  }

  // Format pickup date from form data
  const pickupDateDisplay = formData.pickupDate ? formatDisplayDate(formData.pickupDate) : "--"

  return (
    <div className="w-full">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border-2 border-dashed border-[#3BAB6B] mt-4 relative">
        {/* Edit Button */}
        <button
          onClick={onEdit}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5 sm:gap-2 text-[--text-primary] hover:text-[--brand-primary] transition-colors"
          aria-label="Edit quote details"
        >
          <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">Edit</span>
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8 mt-2">
          <h2 className="font-syne text-2xl sm:text-3xl lg:text-[40px] font-bold text-[--text-primary] mb-2 leading-tight">
            Rate Starting at{" "}
            <span className="text-[--brand-primary]">${formatRate(displayRate.rate)}</span>
          </h2>
          <p className="text-[#666666] text-xs sm:text-sm lg:text-base">
            {displayRate.serviceType
              ? `${displayRate.serviceType} — ${displayRate.carrierName}`
              : `Eligible for LTL Shipping — ${displayRate.carrierName}`}
          </p>
          {displayRate.customMessage && (
            <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              {displayRate.customMessage.split("\n").map((line, i) => (
                <p key={i} className="text-amber-700 text-xs leading-relaxed">{line}</p>
              ))}
            </div>
          )}
          {displayRate.quoteId && (
            <p className="text-[#999999] text-xs mt-1.5">Quote ID: {displayRate.quoteId}</p>
          )}
        </div>

        {/* Rate toggle — show if two different rates exist */}
        {hasAlternative && (
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setSelectedRate("lowest")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors border ${
                selectedRate === "lowest"
                  ? "border-[--brand-primary] bg-[--brand-primary]/10 text-[--brand-primary]"
                  : "border-[#E0E0E0] text-[#666666] hover:border-[--brand-primary]/50"
              }`}
            >
              <span className="block font-semibold">Lowest Cost</span>
              <span className="block text-xs mt-0.5">${formatRate(lowestCost!.rate)} &middot; {lowestCost!.transitDays} days</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRate("quickest")}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors border ${
                selectedRate === "quickest"
                  ? "border-[--brand-primary] bg-[--brand-primary]/10 text-[--brand-primary]"
                  : "border-[#E0E0E0] text-[#666666] hover:border-[--brand-primary]/50"
              }`}
            >
              <span className="block font-semibold">Quickest Transit</span>
              <span className="block text-xs mt-0.5">${formatRate(quickestTransit!.rate)} &middot; {quickestTransit!.transitDays} days</span>
            </button>
          </div>
        )}

        {/* Route Information */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
            <span className="font-poppins text-sm sm:text-base font-semibold text-[--text-primary]">From</span>
            <span className="font-poppins text-sm sm:text-base font-normal text-[--text-primary]">
              {[formData.originCity, formData.originState, formData.originZip].filter(Boolean).join(", ") || formData.originZip}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-poppins text-sm sm:text-base font-semibold text-[--text-primary]">To</span>
            <span className="font-poppins text-sm sm:text-base font-normal text-[--text-primary] sm:ml-7">
              {[formData.destinationCity, formData.destinationState, formData.destinationZip].filter(Boolean).join(", ") || formData.destinationZip}
            </span>
          </div>
        </div>

        {/* Shipment Details */}
        <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          <DetailRow label="Shipment Type" value="LTL" />
          <DetailRow label="Carrier" value={displayRate.carrierName} />
          <DetailRow label="Total Weight" value={`${formData.weight} lbs`} />
          <DetailRow label="Freight Class" value={`Class ${formData.freightClass}`} />
          <DetailRow label="Transit Days" value={`${displayRate.transitDays} business days`} />
          <DetailRow label="Pickup Date" value={pickupDateDisplay} />
          <DetailRow
            label="Estimated Delivery"
            value={formatDisplayDate(displayRate.estimatedDeliveryDate)}
          />
          {displayRate.carrierScac && (
            <DetailRow label="Carrier SCAC" value={displayRate.carrierScac} />
          )}
        </div>

        {/* Charge Breakdown — only show meaningful charges */}
        {(() => {
          const meaningfulCharges = displayRate.charges?.filter(
            (c) => c.description && c.description.trim() !== "" && parseFloat(c.amount) > 0
          )
          return meaningfulCharges && meaningfulCharges.length > 0 ? (
            <div className="mb-6 sm:mb-8">
              <h4 className="text-[--text-primary] font-semibold text-sm mb-2">Charge Breakdown</h4>
              <div className="space-y-1">
                {meaningfulCharges.map((charge, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 text-sm border-b border-[#F0F0F0]">
                    <span className="text-[#666666]">{charge.description}</span>
                    <span className="text-[--text-primary] font-medium">${formatRate(charge.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null
        })()}

        {/* Book Now Button */}
        <Button
          type="button"
          onClick={() => setIsBookingDialogOpen(true)}
          className="w-full flex h-12 sm:h-14 md:h-14.25 justify-center items-center gap-2.5 btn-gradient-green text-white text-sm sm:text-base font-semibold rounded-[35px] transition-all mb-3 sm:mb-4 hover:opacity-90"
        >
          Book NOW
        </Button>

        {/* Contact Link */}
        <div className="text-center">
          <Link
            href="/contact"
            className="inline-block text-[#369E63] text-center font-poppins text-base sm:text-lg font-normal leading-7 hover:underline"
          >
            or Contact Us Directly
          </Link>
        </div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        open={isBookingDialogOpen}
        onOpenChange={setIsBookingDialogOpen}
        quoteData={formData}
      />
    </div>
  )
}

/** Reusable detail row component */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 sm:py-3 border-b border-[#E0E0E0]">
      <span className="text-[#666666] font-poppins text-xs sm:text-sm font-normal">{label}</span>
      <span className="text-[--text-primary] font-poppins text-xs sm:text-sm font-medium flex items-center">
        <svg
          className="w-4 h-4 mr-2"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 8L3 8M13 8L9 4M13 8L9 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {value}
      </span>
    </div>
  )
}
