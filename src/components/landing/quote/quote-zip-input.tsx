"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { US_ZIP_DATA, type USZipEntry } from "@/constants/us-zip-data"
import { lookupZip } from "@/services/zip-lookup.service"
import type { UseFormSetValue, UseFormRegisterReturn } from "react-hook-form"
import type { QuoteFormData } from "@/validations/quote.validation"

type ZipField = "originZip" | "destinationZip"
type CityField = "originCity" | "destinationCity"
type StateField = "originState" | "destinationState"

interface QuoteZipInputProps {
  zipField: ZipField
  cityField: CityField
  stateField: StateField
  registration: UseFormRegisterReturn<ZipField>
  setValue: UseFormSetValue<QuoteFormData>
  error?: string
  placeholder?: string
}

export function QuoteZipInput({
  zipField,
  cityField,
  stateField,
  registration,
  setValue,
  error,
  placeholder = "e.g. 85008",
}: QuoteZipInputProps) {
  const [suggestions, setSuggestions] = useState<USZipEntry[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchZip = useCallback(async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    // Local search — match ZIP prefix or city name
    const localMatches = US_ZIP_DATA.filter(
      (entry) =>
        entry.zip.startsWith(trimmed) ||
        entry.city.toLowerCase().startsWith(trimmed.toLowerCase())
    ).slice(0, 6)

    // API lookup for exact 5-digit ZIP
    if (/^\d{5}$/.test(trimmed)) {
      const apiResult = await lookupZip(trimmed)
      if (apiResult) {
        const alreadyInLocal = localMatches.some(
          (m) => m.zip === trimmed && m.city === apiResult.city
        )
        if (!alreadyInLocal) {
          localMatches.unshift({
            zip: trimmed,
            city: apiResult.city,
            stateCode: apiResult.stateCode,
          })
        }
      }
    }

    setSuggestions(localMatches.slice(0, 6))
    setShowDropdown(localMatches.length > 0)
    setActiveIndex(-1)
  }, [])

  const selectSuggestion = useCallback(
    (entry: USZipEntry) => {
      setValue(zipField, entry.zip, { shouldValidate: true })
      setValue(cityField, entry.city)
      setValue(stateField, entry.stateCode)
      setSuggestions([])
      setShowDropdown(false)
    },
    [zipField, cityField, stateField, setValue]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Call react-hook-form's onChange
    registration.onChange(e)

    const val = e.target.value
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchZip(val), 200)
  }

  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    // Call react-hook-form's onBlur
    registration.onBlur(e)

    // Small delay to allow suggestion click to fire
    setTimeout(async () => {
      const val = e.target.value.trim()
      // Auto-fill city/state if user typed a full 5-digit ZIP
      if (/^\d{5}$/.test(val)) {
        const result = await lookupZip(val)
        if (result) {
          setValue(cityField, result.city)
          setValue(stateField, result.stateCode)
        }
      }
      setShowDropdown(false)
    }, 150)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      selectSuggestion(suggestions[activeIndex])
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={zipField}
        type="text"
        placeholder={placeholder}
        maxLength={10}
        autoComplete="off"
        {...registration}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          const val = e.target.value.trim()
          if (val && suggestions.length > 0) setShowDropdown(true)
        }}
        className={error ? "border-red-500" : ""}
      />

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#E0E0E0] rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((entry, idx) => (
            <li
              key={`${entry.zip}-${entry.city}`}
              onMouseDown={(e) => {
                e.preventDefault()
                selectSuggestion(entry)
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                idx === activeIndex
                  ? "bg-[--brand-primary]/10 text-[--brand-primary]"
                  : "text-[--text-primary] hover:bg-gray-50"
              }`}
            >
              <span className="font-medium">{entry.city}, {entry.stateCode}</span>
              <span className="text-[#999999] ml-2">— {entry.zip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
