"use client"

import { CarrierRateCard } from "../carrier-rate-card"
import type { AllCarrierRate } from "@/types/quote.types"

interface ChooseCarrierStepProps {
  rates: AllCarrierRate[]
  pickupDate: string
  isLoading?: boolean
  error?: string
  onSelectRate: (quoteId: string) => void
  onGoBack?: () => void
}

export function ChooseCarrierStep({ rates, pickupDate, isLoading, error, onSelectRate, onGoBack }: ChooseCarrierStepProps) {
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-0 py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[--brand-primary] mb-4" />
        <p className="font-poppins text-sm sm:text-base text-[#666666]">
          Fetching carrier rates…
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-0 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h3 className="font-syne text-lg font-semibold text-[--text-primary] mb-2">Unable to Fetch Rates</h3>
        <p className="font-poppins text-sm text-[#666666] mb-6 max-w-sm">
          {error}
        </p>
        {onGoBack && (
          <button
            type="button"
            onClick={onGoBack}
            className="inline-flex items-center gap-2 rounded-md bg-[--brand-primary] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            ← Go Back &amp; Fix Details
          </button>
        )}
      </div>
    )
  }

  if (rates.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-4 sm:px-0 py-12 text-center">
        <p className="font-poppins text-sm sm:text-base text-[#666666] mb-6">
          No carrier rates available for this shipment. Please verify your shipment details and try again.
        </p>
        {onGoBack && (
          <button
            type="button"
            onClick={onGoBack}
            className="inline-flex items-center gap-2 rounded-md border border-[--brand-primary] px-5 py-2.5 text-sm font-medium text-[--brand-primary] hover:bg-[--brand-primary] hover:text-white transition-colors"
          >
            ← Go Back &amp; Edit Details
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col px-4 sm:px-0">
      {/* Header */}
      <div className="flex-shrink-0 mb-4 sm:mb-6">
        <h2 className="font-syne text-xl sm:text-2xl md:text-3xl font-bold text-[--text-primary] mb-2">
          Available Rates{" "}
          <span className="text-[--brand-primary]">({rates.length})</span>
        </h2>
        <p className="font-poppins text-sm sm:text-base text-[#666666]">Select a Rate</p>
      </div>

      {/* Carrier Cards Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2">
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {rates.map((rate) => (
            <CarrierRateCard
              key={rate.quoteId}
              rate={rate}
              pickupDate={pickupDate}
              onSelect={onSelectRate}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
