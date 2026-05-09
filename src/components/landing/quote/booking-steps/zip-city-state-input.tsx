"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { US_ZIP_DATA, type USZipEntry } from "@/constants/us-zip-data"
import { lookupZip } from "@/services/zip-lookup.service"
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form"
import type { BookingFormValues } from "@/validations/booking.validation"

interface ZipCityStateInputProps {
  fieldPrefix: "pickup" | "delivery"
  register: UseFormRegister<BookingFormValues>
  errors: FieldErrors<BookingFormValues>
  setValue: UseFormSetValue<BookingFormValues>
  watch: UseFormWatch<BookingFormValues>
}

export function ZipCityStateInput({
  fieldPrefix,
  register,
  errors,
  setValue,
  watch,
}: ZipCityStateInputProps) {
  const [suggestions, setSuggestions] = useState<USZipEntry[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getFieldError = (field: string) => {
    const prefixErrors = errors[fieldPrefix] as Record<string, { message?: string }> | undefined
    return prefixErrors?.[field]
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Core search: filters local data + calls API for 5-digit ZIPs
  const performSearch = useCallback(
    async (query: string) => {
      const q = query.trim()
      if (q.length < 2) {
        setSuggestions([])
        setShowDropdown(false)
        return
      }

      const qLower = q.toLowerCase()

      // 1. Always search local data first (instant)
      const localMatches = US_ZIP_DATA.filter(
        (entry) =>
          entry.zip.startsWith(qLower) ||
          entry.city.toLowerCase().includes(qLower) ||
          entry.stateCode.toLowerCase() === qLower
      ).slice(0, 8)

      // 2. If it's a full 5-digit ZIP, also look up via API
      if (/^\d{5}$/.test(q)) {
        // Show local matches immediately (if any)
        if (localMatches.length > 0) {
          setSuggestions(localMatches)
          setShowDropdown(true)
        }

        setIsLookingUp(true)
        const apiResult = await lookupZip(q)
        setIsLookingUp(false)

        if (apiResult) {
          const apiEntry: USZipEntry = {
            zip: q,
            city: apiResult.city,
            stateCode: apiResult.stateCode,
          }
          // Merge: avoid duplicates (same ZIP)
          const merged = [apiEntry]
          for (const local of localMatches) {
            if (local.zip !== q) merged.push(local)
          }
          setSuggestions(merged.slice(0, 8))
          setShowDropdown(true)
        } else if (localMatches.length === 0) {
          setSuggestions([])
          setShowDropdown(false)
          setZipError("ZIP code not found — please verify")
        }
      } else {
        // Partial text / city search — local only
        setSuggestions(localMatches)
        setShowDropdown(localMatches.length > 0)
      }
    },
    []
  )

  // Debounced search handler
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query)
      setZipError(null)

      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => performSearch(query), 200)
    },
    [performSearch]
  )

  // Handle selecting a suggestion
  const handleSelect = useCallback(
    (entry: USZipEntry) => {
      setValue(`${fieldPrefix}.zip`, entry.zip, { shouldValidate: true })
      setValue(`${fieldPrefix}.city`, entry.city, { shouldValidate: true })
      setValue(`${fieldPrefix}.state`, entry.stateCode, { shouldValidate: true })
      setShowDropdown(false)
      setSearchQuery("")
      setZipError(null)
    },
    [fieldPrefix, setValue]
  )

  // On ZIP field blur — auto-fill city/state via API if not already filled
  const handleZipBlur = useCallback(
    async (e: React.FocusEvent<HTMLInputElement>) => {
      // Call react-hook-form's onBlur
      register(`${fieldPrefix}.zip` as "pickup.zip" | "delivery.zip").onBlur(e)

      const zip = e.target.value?.trim()
      if (!zip || !/^\d{5}$/.test(zip)) return

      // Only auto-fill if city or state is still empty
      const currentCity = watch(`${fieldPrefix}.city`)
      const currentState = watch(`${fieldPrefix}.state`)
      if (currentCity && currentState) return

      setIsLookingUp(true)
      setZipError(null)

      const result = await lookupZip(zip)
      setIsLookingUp(false)

      if (result) {
        if (!currentCity) setValue(`${fieldPrefix}.city`, result.city, { shouldValidate: true })
        if (!currentState) setValue(`${fieldPrefix}.state`, result.stateCode, { shouldValidate: true })
      } else {
        setZipError("ZIP code not found — please verify")
      }
    },
    [fieldPrefix, register, setValue, watch]
  )

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Unified search field */}
      <div className="relative">
        <Label className="text-[--text-primary] font-medium text-sm mb-2 block">
          Search Location{" "}
          <span className="text-[#999] font-normal text-xs">(type ZIP code, city, or state)</span>
        </Label>
        <Input
          type="text"
          placeholder="e.g. 85008, Phoenix, or AZ"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true)
          }}
          autoComplete="off"
        />
        {isLookingUp && (
          <p className="text-[#999] text-xs mt-1">Looking up ZIP code...</p>
        )}

        {/* Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-[#E0E0E0] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((entry, i) => (
              <button
                key={`${entry.zip}-${entry.stateCode}-${i}`}
                type="button"
                className="w-full text-left px-4 py-2.5 hover:bg-[#E8F5ED] transition-colors text-sm font-poppins flex justify-between items-center"
                onMouseDown={(e) => {
                  // Use mouseDown to fire before blur closes the dropdown
                  e.preventDefault()
                  handleSelect(entry)
                }}
              >
                <span className="text-[--text-primary] font-medium">
                  {entry.city}, {entry.stateCode}
                </span>
                <span className="text-[#999] text-xs font-mono">{entry.zip}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ZIP, City, State fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Zip Code */}
        <div className="space-y-2">
          <Label
            htmlFor={`${fieldPrefix}-zip`}
            className="text-[--text-primary] font-medium text-sm"
          >
            Zip Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${fieldPrefix}-zip`}
            type="text"
            placeholder="e.g. 85008"
            maxLength={10}
            {...register(`${fieldPrefix}.zip` as "pickup.zip" | "delivery.zip")}
            onBlur={handleZipBlur}
            className={getFieldError("zip") || zipError ? "border-red-500" : ""}
          />
          {getFieldError("zip") && (
            <p className="text-red-500 text-xs">{getFieldError("zip")?.message}</p>
          )}
          {!getFieldError("zip") && zipError && (
            <p className="text-red-500 text-xs">{zipError}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label
            htmlFor={`${fieldPrefix}-city`}
            className="text-[--text-primary] font-medium text-sm"
          >
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${fieldPrefix}-city`}
            type="text"
            placeholder="e.g. Phoenix"
            {...register(`${fieldPrefix}.city` as "pickup.city" | "delivery.city")}
            className={getFieldError("city") ? "border-red-500" : ""}
          />
          {getFieldError("city") && (
            <p className="text-red-500 text-xs">{getFieldError("city")?.message}</p>
          )}
        </div>

        {/* State */}
        <div className="space-y-2">
          <Label
            htmlFor={`${fieldPrefix}-state`}
            className="text-[--text-primary] font-medium text-sm"
          >
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            id={`${fieldPrefix}-state`}
            type="text"
            placeholder="e.g. AZ"
            maxLength={2}
            {...register(`${fieldPrefix}.state` as "pickup.state" | "delivery.state")}
            className={`uppercase ${getFieldError("state") ? "border-red-500" : ""}`}
          />
          {getFieldError("state") && (
            <p className="text-red-500 text-xs">{getFieldError("state")?.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
