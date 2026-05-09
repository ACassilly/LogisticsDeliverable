"use client"

import { cn } from "@/lib/utils"
import type { LocationType } from "@/types/booking.types"

interface LocationTypeStepProps {
  value: LocationType | null
  onChange: (type: LocationType) => void
  stepType: "Pickup" | "Delivery"
}

export function LocationTypeStep({ value, onChange, stepType }: LocationTypeStepProps) {
  const locationTypes = [
    {
      id: "business" as LocationType,
      title: "Business",
      description: "This is a commercial building or area.",
    },
    {
      id: "residence" as LocationType,
      title: "Residence",
      description:
        "This is a home or home business in a residential area and typically doesn't have a loading dock.",
    },
    {
      id: "trade-show" as LocationType,
      title: "Trade Show",
      description: "This is for events like trade shows and conventions.",
    },
  ]

  return (
    <div className="w-full px-4 sm:px-0">
      <h2 className="font-syne text-xl sm:text-2xl md:text-3xl font-bold text-[--text-primary] mb-6 sm:mb-8">
        What type of location is it?{" "}
        <span className="text-[#3BAB6B]">({stepType})</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {locationTypes.map((type) => {
          const isSelected = value === type.id
          return (
            <button
              key={type.id}
              onClick={() => onChange(type.id)}
              className={cn(
                "relative p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 transition-all hover:shadow-md min-h-[160px] sm:min-h-[180px] h-full flex flex-col",
                isSelected
                  ? "active-selected-card"
                  : "bg-white border-[#E0E0E0] hover:border-[#3BAB6B]/30"
              )}
            >
              {/* Selection Indicator */}
              <div className={cn(
                "absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected 
                  ? "bg-white border-[#3BAB6B]" 
                  : "bg-white border-[#D0D0D0]"
              )}>
                {isSelected && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#3BAB6B] rounded-full" />
                )}
              </div>

              <div className="flex flex-col items-start text-left w-full">
                <h3
                  className={cn(
                    "font-poppins text-base sm:text-lg font-semibold mb-2 sm:mb-3 pr-7 sm:pr-8 text-left justify-start",
                    isSelected ? "text-[#3BAB6B]" : "text-[--text-primary]"
                  )}
                >
                  {type.title}
                </h3>
                <p className="font-poppins text-xs sm:text-sm text-[#666666] leading-relaxed text-left break-words">
                  {type.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
