"use client"

import { useState, useLayoutEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { quoteFormSchema, type QuoteFormData } from "@/validations/quote.validation"
import { QuoteResult } from "./quote-result"
import { BookingDialog } from "./booking-dialog"
import { QuoteZipInput } from "./quote-zip-input"
import { useQuoteRate } from "@/hooks"
import { FREIGHT_CLASSES, type QuoteRateResult, type QuoteRateRequestPayload } from "@/types"

export function QuoteForm() {
  const [showResult, setShowResult] = useState(false)
  const [quoteData, setQuoteData] = useState<{
    lowestCost: QuoteRateResult | null
    quickestTransit: QuoteRateResult | null
    formData: QuoteFormData
  } | null>(null)
  const [isStripeReturnDialogOpen, setIsStripeReturnDialogOpen] = useState(false)
  /**
   * 'success' | 'cancelled' — set when we detect a Stripe return so BookingForm
   * knows which path to take WITHOUT relying on Zustand's isReturnFromStripe flag.
   *
   * Why not Zustand? Zustand v5 persist middleware uses `await` internally even
   * for synchronous storage, so hydration runs as a microtask — AFTER
   * useLayoutEffect sets isReturnFromStripe:true but BEFORE BookingForm's
   * useEffect reads it. The hydration then merges the stored false value back,
   * overriding our true. Passing stripeReturnType as a plain React prop is
   * completely unaffected by Zustand hydration timing.
   */
  const [stripeReturnType, setStripeReturnType] = useState<'success' | 'cancelled' | null>(null)

  /**
   * Detect a Stripe redirect return BEFORE the browser paints (useLayoutEffect)
   * so the dialog is open on the very first visible frame — no flash of the
   * quote form before the booking dialog appears.
   *
   * We read sessionStorage directly instead of Zustand selectors because the
   * persist middleware hydrates asynchronously — selectors may still return
   * initial-state values at this point.
   *
   * Detection covers THREE return paths:
   *   A) Stripe redirects to success URL  →  ?session_id=…
   *   B) Stripe redirects to cancel URL   →  ?payment_cancelled=true
   *   C) User presses the browser back button → no params, but store has
   *      paymentStatus === "pending" and a paymentSessionId
   */
  useLayoutEffect(() => {
    // Read persisted store directly from sessionStorage (synchronous)
    let persisted: { state?: { paymentSessionId?: string | null; paymentStatus?: string } } | null = null
    try {
      const raw = sessionStorage.getItem('booking-storage')
      if (raw) persisted = JSON.parse(raw)
    } catch { /* corrupt data — ignore */ }

    const storedSessionId = persisted?.state?.paymentSessionId
    const storedStatus = persisted?.state?.paymentStatus

    const params = new URLSearchParams(window.location.search)
    const hasSessionId = params.has('session_id')
    const hasCancelled = params.has('payment_cancelled')
    // Case C: browser back button — no URL params but store has a pending session
    const isBrowserBack = !hasSessionId && !hasCancelled && storedStatus === 'pending' && !!storedSessionId

    if (!hasSessionId && !hasCancelled && !isBrowserBack) return
    // Must have a pending session to proceed
    if (!storedSessionId) return

    // Strip the Stripe params from the URL immediately
    if (hasSessionId || hasCancelled) {
      const url = new URL(window.location.href)
      url.searchParams.delete('session_id')
      url.searchParams.delete('payment_cancelled')
      window.history.replaceState({}, '', url.pathname)
    }

    // Pass the return type as a React prop — BookingForm will read it in useEffect
    // (after Zustand hydration has completed) to restore state and navigate to
    // the payment step. This avoids the Zustand hydration race entirely.
    const returnType = hasCancelled || isBrowserBack ? 'cancelled' : 'success'
    setStripeReturnType(returnType)

    // Open the booking dialog — React will synchronously re-render before paint
    setIsStripeReturnDialogOpen(true)
  }, [])

  const { mutateAsync: requestRate, isPending } = useQuoteRate()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      originZip: "",
      originCity: "",
      originState: "",
      destinationZip: "",
      destinationCity: "",
      destinationState: "",
      pickupDate: "",
      weight: undefined as unknown as number,
      freightClass: "",
      email: "",
    },
  })

  const onSubmit = async (data: QuoteFormData) => {
    try {
      // Payload typed against the shared interface — server validates + transforms for GTZShip
      const payload: QuoteRateRequestPayload = {
        pickupDate: data.pickupDate, // YYYY-MM-DD — server converts to MM/DD/YYYY
        email: data.email,
        stackable: false,
        terminalPickup: false,
        shipmentNew: false,
        origin: {
          zip: data.originZip,
          city: data.originCity || undefined,
          state: data.originState ? data.originState.toUpperCase() : undefined,
        },
        destination: {
          zip: data.destinationZip,
          city: data.destinationCity || undefined,
          state: data.destinationState ? data.destinationState.toUpperCase() : undefined,
        },
        items: [
          {
            description: "General Freight",
            pieceCount: 1,
            palletCount: 1,
            weight: data.weight,
            weightType: 1,    // Pounds
            productClass: Number(data.freightClass),
            packageType: 0,   // Std Pallets
            hazmat: false,
            stackable: false,
            length: 40,       // Standard pallet length (in)
            width: 48,        // Standard pallet width (in)
            // height omitted — server defaults to 0 for GTZShip
          },
        ],
      }

      const result = await requestRate(payload)

      if (result.success) {
        setQuoteData({
          lowestCost: result.data.lowestCost,
          quickestTransit: result.data.quickestTransit,
          formData: data,
        })
        setShowResult(true)
      }
    } catch {
      // Error toasts are handled by the useQuoteRate hook's onError callback
    }
  }

  const handleEdit = () => {
    setShowResult(false)
  }

  if (showResult && quoteData) {
    return (
      <>
        <BookingDialog open={isStripeReturnDialogOpen} onOpenChange={setIsStripeReturnDialogOpen} stripeReturnType={stripeReturnType} quoteData={quoteData?.formData} />
        <QuoteResult
          lowestCost={quoteData.lowestCost}
          quickestTransit={quoteData.quickestTransit}
          formData={quoteData.formData}
          onEdit={handleEdit}
        />
      </>
    )
  }

  return (
    <>
      <BookingDialog open={isStripeReturnDialogOpen} onOpenChange={setIsStripeReturnDialogOpen} stripeReturnType={stripeReturnType} quoteData={quoteData?.formData} />
    <div className="w-full bg-transparent rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8 sm:mb-10 text-center">
        <h1 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-[--text-primary] mb-3 sm:mb-4">
          Get a Freight Quote{" "}
          <span className="text-[--brand-primary]">You Can Trust</span>
        </h1>
        <p className="text-[#666666] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
          Transparent pricing, fast response, and full visibility from pickup to delivery.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">

        {/* ── Pickup Location ── */}
        <div>
          <h3 className="text-[--text-primary] font-semibold text-sm mb-3 uppercase tracking-wider">
            Pickup Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="originZip" className="text-[--text-primary] font-medium text-sm">
                Zip Code <span className="text-red-500">*</span>
              </Label>
              <QuoteZipInput
                zipField="originZip"
                cityField="originCity"
                stateField="originState"
                registration={register("originZip")}
                setValue={setValue}
                error={errors.originZip?.message}
                placeholder="e.g. 85008"
              />
              {errors.originZip && (
                <p className="text-red-500 text-xs">{errors.originZip.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="originCity" className="text-[--text-primary] font-medium text-sm">
                City
              </Label>
              <Input
                id="originCity"
                type="text"
                placeholder="e.g. Phoenix"
                {...register("originCity")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originState" className="text-[--text-primary] font-medium text-sm">
                State
              </Label>
              <Input
                id="originState"
                type="text"
                placeholder="e.g. AZ"
                maxLength={2}
                {...register("originState")}
              />
            </div>
          </div>
        </div>

        {/* ── Delivery Location ── */}
        <div>
          <h3 className="text-[--text-primary] font-semibold text-sm mb-3 uppercase tracking-wider">
            Delivery Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="destinationZip" className="text-[--text-primary] font-medium text-sm">
                Zip Code <span className="text-red-500">*</span>
              </Label>
              <QuoteZipInput
                zipField="destinationZip"
                cityField="destinationCity"
                stateField="destinationState"
                registration={register("destinationZip")}
                setValue={setValue}
                error={errors.destinationZip?.message}
                placeholder="e.g. 77868"
              />
              {errors.destinationZip && (
                <p className="text-red-500 text-xs">{errors.destinationZip.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="destinationCity" className="text-[--text-primary] font-medium text-sm">
                City
              </Label>
              <Input
                id="destinationCity"
                type="text"
                placeholder="e.g. Navasota"
                {...register("destinationCity")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destinationState" className="text-[--text-primary] font-medium text-sm">
                State
              </Label>
              <Input
                id="destinationState"
                type="text"
                placeholder="e.g. TX"
                maxLength={2}
                {...register("destinationState")}
              />
            </div>
          </div>
        </div>

        {/* ── Pickup Date & Weight ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-2">
            <Label htmlFor="pickupDate" className="text-[--text-primary] font-medium flex items-center gap-2 text-sm">
              Pickup Date <span className="text-red-500">*</span>
              <Info className="w-4 h-4 text-[--brand-primary]" />
            </Label>
            <Input
              id="pickupDate"
              type="date"
              {...register("pickupDate")}
              className={errors.pickupDate ? "border-red-500" : ""}
            />
            {errors.pickupDate && (
              <p className="text-red-500 text-xs">{errors.pickupDate.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-[--text-primary] font-medium flex items-center gap-2 text-sm">
              Total Shipping Weight (lbs) <span className="text-red-500">*</span>
              <Info className="w-4 h-4 text-[--brand-primary]" />
            </Label>
            <Input
              id="weight"
              type="number"
              min={1}
              placeholder="e.g. 1000"
              {...register("weight", { valueAsNumber: true })}
              className={errors.weight ? "border-red-500" : ""}
            />
            {errors.weight && (
              <p className="text-red-500 text-xs">{errors.weight.message}</p>
            )}
          </div>
        </div>

        {/* ── Freight Class & Email ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-2">
            <Label htmlFor="freightClass" className="text-[--text-primary] font-medium text-sm">
              Freight Class <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="freightClass"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="freightClass"
                    className={errors.freightClass ? "border-red-500 text-[#999999]" : "text-[#999999]"}
                  >
                    <SelectValue placeholder="Select Freight Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREIGHT_CLASSES.map((fc) => (
                      <SelectItem key={fc} value={String(fc)}>
                        Class {fc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.freightClass && (
              <p className="text-red-500 text-xs">{errors.freightClass.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[--text-primary] font-medium text-sm">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full flex h-12 sm:h-14 md:h-14.25 justify-center items-center gap-2.5 btn-gradient-green text-white text-sm sm:text-base font-semibold rounded-[35px] transition-all mt-4 sm:mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Getting Rates...
            </>
          ) : (
            "Get Instant Quote"
          )}
        </Button>

        {/* Contact Link */}
        <div className="text-center">
          <Link
            href="/contact"
            className="inline-block h-7 self-stretch text-[#369E63] text-center font-poppins text-lg font-normal leading-7 hover:underline"
          >
            or Contact Us Directly
          </Link>
        </div>
      </form>
    </div>
    </>
  )
}
