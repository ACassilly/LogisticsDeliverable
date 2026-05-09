"use client"

import { useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ZipCityStateInput } from "./zip-city-state-input"
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form"
import type { BookingFormValues } from "@/validations/booking.validation"

interface WhereAndWhenStepProps {
  stepType: "Pickup" | "Delivery"
  register: UseFormRegister<BookingFormValues>
  errors: FieldErrors<BookingFormValues>
  fieldPrefix: "pickup" | "delivery"
  setValue: UseFormSetValue<BookingFormValues>
  watch: UseFormWatch<BookingFormValues>
}

export function WhereAndWhenStep({
  stepType,
  register,
  errors,
  fieldPrefix,
  setValue,
  watch,
}: WhereAndWhenStepProps) {
  // Minimum pickup date: 2 days from today
  const minPickupDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().split("T")[0]
  }, [])

  return (
    <div className="w-full px-4 sm:px-0">
      <h2 className="font-syne text-xl sm:text-2xl md:text-3xl font-bold text-[--text-primary] mb-6 sm:mb-8">
        Where and when is the {stepType.toLowerCase()}?
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {/* ZIP / City / State with autocomplete */}
        <ZipCityStateInput
          fieldPrefix={fieldPrefix}
          register={register}
          errors={errors}
          setValue={setValue}
          watch={watch}
        />

        {/* Street Address (Optional) */}
        <div className="space-y-2">
          <Label htmlFor={`${fieldPrefix}-street`} className="text-[--text-primary] font-medium text-sm">
            Street Address
          </Label>
          <Input
            id={`${fieldPrefix}-street`}
            type="text"
            placeholder="e.g. 123 Main Street"
            {...register(`${fieldPrefix}.street` as "pickup.street" | "delivery.street")}
          />
        </div>

        {/* Pickup Date — only for pickup */}
        {fieldPrefix === "pickup" && (
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="pickup-pickupDate" className="text-[--text-primary] font-medium text-sm">
              Pickup Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pickup-pickupDate"
              type="date"
              min={minPickupDate}
              {...register("pickup.pickupDate")}
              className={`w-full ${
                (errors.pickup as Record<string, { message?: string }> | undefined)?.pickupDate ? "border-red-500" : ""
              }`}
            />
            {(errors.pickup as Record<string, { message?: string }> | undefined)?.pickupDate && (
              <p className="text-red-500 text-xs">
                {(errors.pickup as Record<string, { message?: string }> | undefined)?.pickupDate?.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
