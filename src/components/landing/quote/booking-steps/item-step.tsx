"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form"
import type { BookingFormValues } from "@/validations/booking.validation"
import { PACKAGE_TYPE_LABELS, FREIGHT_CLASSES } from "@/types/quote.types"

interface ItemStepProps {
  itemIndex: number
  register: UseFormRegister<BookingFormValues>
  errors: FieldErrors<BookingFormValues>
  setValue: UseFormSetValue<BookingFormValues>
}

export function ItemStep({ itemIndex, register, errors, setValue }: ItemStepProps) {
  const itemErrors = errors.items?.[itemIndex]

  return (
    <div className="w-full px-4 sm:px-0">
      <h2 className="font-syne text-xl sm:text-2xl md:text-3xl font-bold mb-2">
        Item <span className="text-[--brand-primary]">0{itemIndex + 1}</span>
      </h2>
      <p className="font-poppins text-base sm:text-lg font-semibold text-[--text-primary] mb-6 sm:mb-8">
        What are you shipping?
      </p>

      <div className="space-y-4 sm:space-y-6">
        {/* Description (required) */}
        <div className="space-y-2">
          <Label htmlFor={`items.${itemIndex}.description`} className="text-[--text-primary] font-medium text-sm">
            Description <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`items.${itemIndex}.description`}
            type="text"
            placeholder="e.g. Auto parts, Electronics"
            maxLength={200}
            {...register(`items.${itemIndex}.description` as `items.${number}.description`)}
            className={itemErrors?.description ? "border-red-500" : ""}
          />
          {itemErrors?.description && (
            <p className="text-red-500 text-xs">{itemErrors.description.message}</p>
          )}
        </div>

        {/* Row: Piece Count, Pallet Count, Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor={`items.${itemIndex}.pieceCount`} className="text-[--text-primary] font-medium text-sm">
              Piece Count <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`items.${itemIndex}.pieceCount`}
              type="number"
              min={1}
              placeholder="1"
              {...register(`items.${itemIndex}.pieceCount` as `items.${number}.pieceCount`, { valueAsNumber: true })}
              className={itemErrors?.pieceCount ? "border-red-500" : ""}
            />
            {itemErrors?.pieceCount && (
              <p className="text-red-500 text-xs">{itemErrors.pieceCount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`items.${itemIndex}.palletCount`} className="text-[--text-primary] font-medium text-sm">
              Pallet Count <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`items.${itemIndex}.palletCount`}
              type="number"
              min={1}
              placeholder="1"
              {...register(`items.${itemIndex}.palletCount` as `items.${number}.palletCount`, { valueAsNumber: true })}
              className={itemErrors?.palletCount ? "border-red-500" : ""}
            />
            {itemErrors?.palletCount && (
              <p className="text-red-500 text-xs">{itemErrors.palletCount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`items.${itemIndex}.weight`} className="text-[--text-primary] font-medium text-sm">
              Weight (lbs) <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`items.${itemIndex}.weight`}
              type="number"
              min={1}
              placeholder="e.g. 500"
              {...register(`items.${itemIndex}.weight` as `items.${number}.weight`, { valueAsNumber: true })}
              className={itemErrors?.weight ? "border-red-500" : ""}
            />
            {itemErrors?.weight && (
              <p className="text-red-500 text-xs">{itemErrors.weight.message}</p>
            )}
          </div>
        </div>

        {/* Row: Package Type, Freight Class */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor={`items.${itemIndex}.packageType`} className="text-[--text-primary] font-medium text-sm">
              Package Type <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue(`items.${itemIndex}.packageType` as `items.${number}.packageType`, Number(value))
              }
            >
              <SelectTrigger
                id={`items.${itemIndex}.packageType`}
                className={itemErrors?.packageType ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select package type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PACKAGE_TYPE_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {itemErrors?.packageType && (
              <p className="text-red-500 text-xs">{itemErrors.packageType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`items.${itemIndex}.productClass`} className="text-[--text-primary] font-medium text-sm">
              Freight Class <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue(`items.${itemIndex}.productClass` as `items.${number}.productClass`, Number(value))
              }
            >
              <SelectTrigger
                id={`items.${itemIndex}.productClass`}
                className={itemErrors?.productClass ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select freight class" />
              </SelectTrigger>
              <SelectContent>
                {FREIGHT_CLASSES.map((fc) => (
                  <SelectItem key={fc} value={String(fc)}>
                    Class {fc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {itemErrors?.productClass && (
              <p className="text-red-500 text-xs">{itemErrors.productClass.message}</p>
            )}
          </div>
        </div>

        {/* Row: Length, Width, Height */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="space-y-2">
            <Label htmlFor={`items.${itemIndex}.length`} className="text-[--text-primary] font-medium text-sm">
              Length (in)
            </Label>
            <Input
              id={`items.${itemIndex}.length`}
              type="number"
              min={0}
              placeholder="0"
              {...register(`items.${itemIndex}.length` as `items.${number}.length`, { valueAsNumber: true })}
              className={itemErrors?.length ? "border-red-500" : ""}
            />
            {itemErrors?.length && (
              <p className="text-red-500 text-xs">{itemErrors.length.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`items.${itemIndex}.width`} className="text-[--text-primary] font-medium text-sm">
              Width (in)
            </Label>
            <Input
              id={`items.${itemIndex}.width`}
              type="number"
              min={0}
              placeholder="0"
              {...register(`items.${itemIndex}.width` as `items.${number}.width`, { valueAsNumber: true })}
              className={itemErrors?.width ? "border-red-500" : ""}
            />
            {itemErrors?.width && (
              <p className="text-red-500 text-xs">{itemErrors.width.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`items.${itemIndex}.height`} className="text-[--text-primary] font-medium text-sm">
              Height (in)
            </Label>
            <Input
              id={`items.${itemIndex}.height`}
              type="number"
              min={0}
              placeholder="0"
              {...register(`items.${itemIndex}.height` as `items.${number}.height`, { valueAsNumber: true })}
              className={itemErrors?.height ? "border-red-500" : ""}
            />
            {itemErrors?.height && (
              <p className="text-red-500 text-xs">{itemErrors.height.message}</p>
            )}
          </div>
        </div>

        {/* NMFC Number (optional) */}
        <div className="max-w-xs space-y-2">
          <Label htmlFor={`items.${itemIndex}.nmfcNumber`} className="text-[--text-primary] font-medium text-sm">
            NMFC Number
          </Label>
          <Input
            id={`items.${itemIndex}.nmfcNumber`}
            type="text"
            placeholder=""
            {...register(`items.${itemIndex}.nmfcNumber` as `items.${number}.nmfcNumber`)}
          />
        </div>
      </div>
    </div>
  )
}
