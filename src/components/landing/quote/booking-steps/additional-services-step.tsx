"use client"

import { cn } from "@/lib/utils"
import type { UseFormSetValue, UseFormWatch } from "react-hook-form"
import type { BookingFormValues } from "@/validations/booking.validation"

interface AdditionalServicesStepProps {
  stepType: "Pickup" | "Delivery"
  setValue: UseFormSetValue<BookingFormValues>
  watch: UseFormWatch<BookingFormValues>
  fieldPrefix: "pickup" | "delivery"
}

export function AdditionalServicesStep({
  setValue,
  watch,
  fieldPrefix,
}: AdditionalServicesStepProps) {
  const baseServices = [
    {
      id: "liftgateRequired",
      title: "Liftgate",
      description:
        "Facilities without a loading dock or forklift require a liftgate to lift & lower pallets to the ground.",
    },
    {
      id: fieldPrefix === "pickup" ? "insidePickup" : "insideDelivery",
      title: fieldPrefix === "pickup" ? "Inside Pickup" : "Inside Delivery",
      description:
        "The driver will need to move freight beyond the loading dock or entrance.",
    },
    {
      id: "appointmentRequired",
      title: "Appointment Required",
      description:
        "A scheduled appointment is needed before the carrier can pick up or deliver at this location.",
    },
  ]

  // Add delivery-specific services
  const deliveryOnlyServices = [
    {
      id: "notifyReceiverPriorToDelivery",
      title: "Notify Receiver Prior to Delivery",
      description:
        "The carrier will call the receiver before arriving to confirm delivery.",
    },
  ]

  const services = fieldPrefix === "delivery" 
    ? [...baseServices, ...deliveryOnlyServices]
    : baseServices

  const handleServiceSelect = (serviceId: string) => {
    const fieldName = `${fieldPrefix}.${serviceId}` as keyof BookingFormValues
    const currentValue = watch(fieldName)
    setValue(fieldName, !currentValue)
  }

  return (
    <div className="w-full px-4 sm:px-0">
      <h2 className="font-syne text-xl sm:text-2xl md:text-3xl font-bold text-[--text-primary] mb-6 sm:mb-8">
        Need additional services?
      </h2>

      <div className={cn(
        "grid grid-cols-1 gap-4 sm:gap-6",
        fieldPrefix === "delivery" ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {services.map((service) => {
          const fieldName = `${fieldPrefix}.${service.id}` as keyof BookingFormValues
          const isSelected = watch(fieldName)

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => handleServiceSelect(service.id)}
              className={cn(
                "relative p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border-2 transition-all hover:shadow-md min-h-[180px] sm:min-h-[200px] h-full flex flex-col",
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
                <h3 className="font-poppins text-base sm:text-lg font-semibold text-[#3BAB6B] mb-2 sm:mb-3 pr-7 sm:pr-8 text-left justify-start">
                  {service.title}
                </h3>
                <p className="text-[#666666] font-poppins text-xs sm:text-sm leading-relaxed text-left break-words">
                  {service.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
