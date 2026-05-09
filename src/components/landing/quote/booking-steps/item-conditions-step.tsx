"use client"

import { cn } from "@/lib/utils"
import type { UseFormSetValue, UseFormWatch } from "react-hook-form"
import type { BookingFormValues } from "@/validations/booking.validation"

interface ItemConditionsStepProps {
  itemIndex: number
  setValue: UseFormSetValue<BookingFormValues>
  watch: UseFormWatch<BookingFormValues>
}

export function ItemConditionsStep({ itemIndex, setValue, watch }: ItemConditionsStepProps) {
  const conditions = [
    {
      id: "hazmat",
      title: "Hazmat",
      description: "This shipment contains hazardous materials that require special handling.",
    },
    {
      id: "stackable",
      title: "Stackable",
      description: "This freight can be safely stacked during transit.",
    },
    {
      id: "protectFromFreezing",
      title: "Protect from freezing",
      description: "This shipment must be protected from freezing temperatures.",
    },
  ]

  const handleConditionSelect = (conditionId: string) => {
    const fieldName = `items.${itemIndex}.${conditionId}` as `items.${number}.hazmat` | `items.${number}.stackable` | `items.${number}.protectFromFreezing`
    const currentValue = watch(fieldName)
    setValue(fieldName, !currentValue)
  }

  return (
    <div className="w-full px-4 sm:px-0">
      <h2 className="font-syne text-xl sm:text-2xl md:text-3xl font-bold mb-2">
        Item <span className="text-[--brand-primary]">0{itemIndex + 1}</span>
      </h2>
      <p className="font-poppins text-base sm:text-lg font-semibold text-[--text-primary] mb-6 sm:mb-8">
        Does your shipment meet any of the following conditions?
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {conditions.map((condition) => {
          const fieldName = `items.${itemIndex}.${condition.id}` as `items.${number}.hazmat` | `items.${number}.stackable` | `items.${number}.protectFromFreezing`
          const isSelected = watch(fieldName)

          return (
            <button
              key={condition.id}
              type="button"
              onClick={() => handleConditionSelect(condition.id)}
              className={cn(
                "relative p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 transition-all hover:shadow-md min-h-[160px] sm:min-h-[180px] h-full flex flex-col",
                isSelected
                  ? "bg-[#E8F5ED] border-[--brand-primary]"
                  : "bg-white border-[#E0E0E0] hover:border-[--brand-primary]/30"
              )}
            >
              {/* Selection Indicator */}
              <div className={cn(
                "absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all",
                isSelected 
                  ? "bg-white border-[--brand-primary]" 
                  : "bg-white border-[#D0D0D0]"
              )}>
                {isSelected && (
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[--brand-primary] rounded-full" />
                )}
              </div>

              <div className="flex flex-col items-start text-left w-full">
                <h3 className="font-poppins text-base sm:text-lg font-semibold text-[--text-primary] mb-2 sm:mb-3 pr-7 sm:pr-8 text-left justify-start">
                  {condition.title}
                </h3>
                <p className="text-[#666666] font-poppins text-xs sm:text-sm leading-relaxed text-left break-words">
                  {condition.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
