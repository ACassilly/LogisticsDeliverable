"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { BookingStepper } from "./booking-stepper"
import { BookingSidebar } from "./booking-sidebar"
import { LocationTypeStep } from "./booking-steps/location-type-step"
import { WhereAndWhenStep } from "./booking-steps/where-when-step"
import { AdditionalServicesStep } from "./booking-steps/additional-services-step"
import { ItemStep } from "./booking-steps/item-step"
import { ItemConditionsStep } from "./booking-steps/item-conditions-step"
import { ChooseCarrierStep } from "./booking-steps/choose-carrier-step"
import { FinalizeStep } from "./booking-steps/finalize-step"
import { PaymentStep } from "./booking-steps/payment-step"
import { OrderDetailsSuccessDialog } from "./order-details-success-dialog"
import { FinalizeSuccessDialog } from "./finalize-success-dialog"
import { PaymentSuccessDialog } from "./payment-success-dialog"
import { bookingFormSchema, type BookingFormValues } from "@/validations/booking.validation"
import type { BookingStep, OrderDetailsSubStep, DetailsMicroStep, ItemMicroStep, LocationType } from "@/types/booking.types"
import type { AllCarrierRate, QuoteRateRequestPayload } from "@/types/quote.types"
import { useAllCarrierRates } from "@/hooks"
import { useBookingStore } from "@/store"
import { CHECKOUT_API_ENDPOINTS } from "@/constants"
import { Phone, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { QuoteFormData } from "@/validations/quote.validation"

interface BookingFormProps {
  onClose: () => void
  /** Set by QuoteForm when it detects a Stripe redirect return. BookingForm uses
   *  this as the trigger to restore persisted state and jump to the payment step.
   *  Using a React prop instead of Zustand's isReturnFromStripe avoids the
   *  Zustand v5 persist-middleware hydration race: hydration runs as a microtask
   *  and overwrites any Zustand flag set in useLayoutEffect before BookingForm
   *  mounts. By the time BookingForm's useEffect runs (after paint), Zustand is
   *  fully hydrated and all store values (formSnapshot, carrierRates, …) are safe
   *  to read. */
  stripeReturnType?: 'success' | 'cancelled' | null
  /** Pre-populate booking fields from the Get a Quote form. */
  quoteData?: QuoteFormData
}

export function BookingForm({ onClose, stripeReturnType, quoteData }: BookingFormProps) {
  const [currentMainStep, setCurrentMainStep] = useState<BookingStep>("order-details")
  const [currentSubStep, setCurrentSubStep] = useState<OrderDetailsSubStep>("pickup")
  const [currentMicroStep, setCurrentMicroStep] = useState<DetailsMicroStep>("type")
  const [currentItemMicroStep, setCurrentItemMicroStep] = useState<ItemMicroStep>("details")
  const [completedPickupSteps, setCompletedPickupSteps] = useState<DetailsMicroStep[]>([])
  const [completedDeliverySteps, setCompletedDeliverySteps] = useState<DetailsMicroStep[]>([])
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [completedItems, setCompletedItems] = useState<number[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showFinalizeSuccessDialog, setShowFinalizeSuccessDialog] = useState(false)
  const [showPaymentSuccessDialog, setShowPaymentSuccessDialog] = useState(false)
  const [enteredOtp, setEnteredOtp] = useState("")
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null)
  const [carrierRates, setCarrierRates] = useState<AllCarrierRate[]>([])
  const [carrierRatesError, setCarrierRatesError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState("")
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [otpError, setOtpError] = useState<string | null>(null)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const bookingStore = useBookingStore()

  const { mutateAsync: fetchCarrierRates, isPending: isLoadingRates } = useAllCarrierRates()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    mode: "onTouched",
    defaultValues: {
      pickup: {
        type: "business",
        zip: "",
        city: "",
        state: "",
        street: "",
        pickupDate: "",
        liftgateRequired: false,
        insidePickup: false,
        appointmentRequired: false,
      },
      delivery: {
        type: "business",
        zip: "",
        city: "",
        state: "",
        street: "",
        liftgateRequired: false,
        insideDelivery: false,
        appointmentRequired: false,
        notifyReceiverPriorToDelivery: false,
      },
      items: [
        {
          description: "",
          pieceCount: 1,
          palletCount: 1,
          weight: undefined as unknown as number,
          packageType: 0,
          productClass: 50,
          length: 0,
          width: 0,
          height: 0,
          nmfcNumber: "",
          hazmat: false,
          stackable: false,
          protectFromFreezing: false,
        },
      ],
    },
  })

  const pickupType = watch("pickup.type")
  const deliveryType = watch("delivery.type")

  // Pre-populate booking form from Get a Quote form data
  useEffect(() => {
    if (!quoteData) return
    setValue("pickup.zip", quoteData.originZip)
    if (quoteData.originCity) setValue("pickup.city", quoteData.originCity)
    if (quoteData.originState) setValue("pickup.state", quoteData.originState)
    if (quoteData.pickupDate) setValue("pickup.pickupDate", quoteData.pickupDate)
    setValue("delivery.zip", quoteData.destinationZip)
    if (quoteData.destinationCity) setValue("delivery.city", quoteData.destinationCity)
    if (quoteData.destinationState) setValue("delivery.state", quoteData.destinationState)
    if (quoteData.weight) setValue("items.0.weight", quoteData.weight)
    if (quoteData.freightClass) setValue("items.0.productClass", Number(quoteData.freightClass))
    if (quoteData.email) setUserEmail(quoteData.email)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate completion status
  const isPickupCompleted = completedPickupSteps.length === 3
  const isDeliveryCompleted = completedDeliverySteps.length === 3
  const hasCompletedItems = completedItems.length > 0

  // Calculate current step number for stepper
  const getCurrentStepNumber = () => {
    switch (currentMainStep) {
      case "order-details":
        return 1
      case "choose-carrier":
        return 2
      case "finalize":
        return 3
      case "payment":
        return 4
      default:
        return 1
    }
  }

  const steps = [
    { 
      number: 1, 
      label: "Order Details", 
      isActive: currentMainStep === "order-details", 
      isCompleted: currentMainStep !== "order-details" && (isPickupCompleted && isDeliveryCompleted && hasCompletedItems)
    },
    { 
      number: 2, 
      label: "Choose Carrier", 
      isActive: currentMainStep === "choose-carrier", 
      isCompleted: false 
    },
    { 
      number: 3, 
      label: "Finalize", 
      isActive: currentMainStep === "finalize", 
      isCompleted: false 
    },
    { 
      number: 4, 
      label: "Payment", 
      isActive: currentMainStep === "payment", 
      isCompleted: false 
    },
  ]

  const handleSendOtp = async (email: string) => {
    setIsSendingOtp(true)
    setOtpError(null)
    try {
      const res = await fetch("/api/quote/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data: { success: boolean; error?: string; devCode?: string; cooldownRemaining?: number } = await res.json()
      if (!res.ok) {
        setOtpError(data.error ?? "Failed to send code. Please try again.")
        return
      }
      setOtpSent(true)
      // Expose devCode to FinalizeStep via custom event
      if (data.devCode) {
        window.dispatchEvent(new CustomEvent("otp:devCode", { detail: { code: data.devCode } }))
      }
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleNavigation = (
    mainStep: BookingStep,
    subStep?: OrderDetailsSubStep,
    microStep?: DetailsMicroStep,
    itemIndex?: number
  ) => {
    setCurrentMainStep(mainStep)
    if (subStep) setCurrentSubStep(subStep)
    if (microStep) setCurrentMicroStep(microStep)
    if (itemIndex !== undefined) setCurrentItemIndex(itemIndex)
  }

  const handleNext = async () => {
    // Handle finalize step - verify OTP
    if (currentMainStep === "finalize") {
      // Already verified — skip OTP entirely
      if (isEmailVerified) {
        setShowFinalizeSuccessDialog(true)
        return
      }
      if (!otpSent) {
        setOtpError("Please send a verification code to your email first.")
        return
      }
      if (enteredOtp.length < 6) {
        setOtpError("Please enter the complete 6-digit code.")
        return
      }
      setIsVerifyingOtp(true)
      setOtpError(null)
      try {
        const res = await fetch("/api/quote/otp/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, code: enteredOtp }),
        })
        const data: { success: boolean; error?: string } = await res.json()
        if (!res.ok || !data.success) {
          setOtpError(data.error ?? "Invalid code. Please try again.")
          return
        }
        setIsEmailVerified(true)
        setShowFinalizeSuccessDialog(true)
      } finally {
        setIsVerifyingOtp(false)
      }
      return
    }

    // Handle items sub-step with micro-steps
    if (currentSubStep === "items") {
      if (currentItemMicroStep === "details") {
        // Validate item details fields
        const fieldsToValidate = [
          `items.${currentItemIndex}.description`,
          `items.${currentItemIndex}.pieceCount`,
          `items.${currentItemIndex}.palletCount`,
          `items.${currentItemIndex}.weight`,
          `items.${currentItemIndex}.packageType`,
          `items.${currentItemIndex}.productClass`,
        ] as const
        
        const isValid = await trigger(fieldsToValidate as unknown as ("items.0.description" | "items.0.pieceCount" | "items.0.palletCount" | "items.0.weight" | "items.0.packageType" | "items.0.productClass")[])
        if (!isValid) return

        // Move to conditions step
        setCurrentItemMicroStep("conditions")
      } else if (currentItemMicroStep === "conditions") {
        // No validation needed for conditions, just mark item as completed
        setCompletedItems((prev) => Array.from(new Set([...prev, currentItemIndex])))
        
        // Check if all items are completed
        const totalItems = watch("items")?.length || 0
        const allItemsCompleted = completedItems.length + 1 >= totalItems
        
        if (allItemsCompleted) {
          // Show success dialog
          setShowSuccessDialog(true)
        } else {
          // Move to next item if exists
          if (currentItemIndex + 1 < totalItems) {
            setCurrentItemIndex(currentItemIndex + 1)
            setCurrentItemMicroStep("details")
          } else {
            setShowSuccessDialog(true)
          }
        }
      }
      return
    }

    const fieldPrefix = currentSubStep

    if (currentMicroStep === "type") {
      // Validate type selection
      const isValid = await trigger(`${fieldPrefix}.type`)
      if (!isValid) return

      // Mark as completed and move to next
      if (currentSubStep === "pickup") {
        setCompletedPickupSteps((prev) => Array.from(new Set([...prev, "type" as DetailsMicroStep])))
      } else {
        setCompletedDeliverySteps((prev) => Array.from(new Set([...prev, "type" as DetailsMicroStep])))
      }
      setCurrentMicroStep("where-when")
    } else if (currentMicroStep === "where-when") {
      // Validate where-when fields
      const fieldsToValidate = [
        `${fieldPrefix}.zip`,
        `${fieldPrefix}.city`,
        `${fieldPrefix}.state`,
      ]

      if (fieldPrefix === "pickup") {
        fieldsToValidate.push(`${fieldPrefix}.pickupDate`)
      }

      const isValid = await trigger(fieldsToValidate as (keyof BookingFormValues)[])
      if (!isValid) return

      // Mark as completed and move to next
      if (currentSubStep === "pickup") {
        setCompletedPickupSteps((prev) => Array.from(new Set([...prev, "where-when" as DetailsMicroStep])))
      } else {
        setCompletedDeliverySteps((prev) => Array.from(new Set([...prev, "where-when" as DetailsMicroStep])))
      }
      setCurrentMicroStep("additional-services")
    } else if (currentMicroStep === "additional-services") {
      // No validation needed for additional services, just mark as completed
      if (currentSubStep === "pickup") {
        setCompletedPickupSteps((prev) => Array.from(new Set([...prev, "additional-services" as DetailsMicroStep])))
        // Move to delivery
        setCurrentSubStep("delivery")
        setCurrentMicroStep("type")
      } else if (currentSubStep === "delivery") {
        setCompletedDeliverySteps((prev) => Array.from(new Set([...prev, "additional-services" as DetailsMicroStep])))
        // Move to items
        setCurrentSubStep("items")
        setCurrentItemMicroStep("details")
      }
    }
  }

  const handleAddAnotherItem = () => {
    // Only allow adding items from conditions step
    if (currentItemMicroStep !== "conditions") return

    // Validate current item before adding another
    trigger(`items.${currentItemIndex}` as `items.${number}`).then((isValid) => {
      if (isValid) {
        // Mark current item as completed
        setCompletedItems((prev) => Array.from(new Set([...prev, currentItemIndex])))
        
        // Add new empty item
        const currentItems = watch("items") || []
        setValue("items", [
          ...currentItems,
          {
            description: "",
            pieceCount: 1,
            palletCount: 1,
            weight: undefined as unknown as number,
            packageType: 0,
            productClass: 50,
            length: 0,
            width: 0,
            height: 0,
            nmfcNumber: "",
            hazmat: false,
            stackable: false,
            protectFromFreezing: false,
          },
        ])
        
        // Move to new item's detail step
        setCurrentItemIndex(currentItems.length)
        setCurrentItemMicroStep("details")
      }
    })
  }

  const handleCancel = () => {
    // Go back from finalize step to choose-carrier
    if (currentMainStep === "finalize") {
      setOtpError(null)
      // Only reset OTP input state if not yet verified — preserve verified status
      if (!isEmailVerified) {
        setOtpSent(false)
        setEnteredOtp("")
      }
      setCurrentMainStep("choose-carrier")
      return
    }
    // Go back one step
    if (currentSubStep === "items") {
      if (currentItemMicroStep === "conditions") {
        // Go back to item details
        setCurrentItemMicroStep("details")
      } else {
        // Go back to delivery's additional services
        setCurrentSubStep("delivery")
        setCurrentMicroStep("additional-services")
      }
    } else if (currentMicroStep === "additional-services") {
      setCurrentMicroStep("where-when")
    } else if (currentMicroStep === "where-when") {
      setCurrentMicroStep("type")
    } else if (currentMicroStep === "type" && currentSubStep === "delivery") {
      setCurrentSubStep("pickup")
      setCurrentMicroStep("additional-services")
    } else {
      onClose()
    }
  }

  const onSubmit = async (data: BookingFormValues) => {
    console.log("Booking submitted:", data)
    // Handle booking submission
  }

  const handleSuccessDialogBack = () => {
    setShowSuccessDialog(false)
    // Stay on current item conditions step
  }

  const handleSuccessDialogChooseCarrier = async () => {
    setShowSuccessDialog(false)

    // Build accessorials array from form toggles and location types
    const formData = watch()
    const accessorials: number[] = []

    // Pickup location type
    if (formData.pickup.type === "residence") accessorials.push(13)
    // Delivery location type
    if (formData.delivery.type === "residence") accessorials.push(14)

    // Pickup services
    if (formData.pickup.liftgateRequired) accessorials.push(11)
    if (formData.pickup.insidePickup) accessorials.push(105)
    if (formData.pickup.appointmentRequired) accessorials.push(152)

    // Delivery services
    if (formData.delivery.liftgateRequired) accessorials.push(12)
    if (formData.delivery.insideDelivery) accessorials.push(15)
    if (formData.delivery.appointmentRequired) accessorials.push(153)
    if (formData.delivery.notifyReceiverPriorToDelivery) accessorials.push(17)

    // Item-level: protectFromFreezing
    const hasProtectFromFreezing = formData.items.some((item) => item.protectFromFreezing)
    if (hasProtectFromFreezing) accessorials.push(116)

    // Check if any item is stackable (use first item to determine top-level flag)
    const isStackable = formData.items.some((item) => item.stackable)

    const payload: QuoteRateRequestPayload = {
      pickupDate: formData.pickup.pickupDate,
      stackable: isStackable,
      terminalPickup: false,
      shipmentNew: true,
      email: "quote@portlandialogistics.com",
      origin: {
        zip: formData.pickup.zip,
        city: formData.pickup.city,
        state: formData.pickup.state,
        street: formData.pickup.street || undefined,
      },
      destination: {
        zip: formData.delivery.zip,
        city: formData.delivery.city,
        state: formData.delivery.state,
        street: formData.delivery.street || undefined,
      },
      items: formData.items.map((item) => ({
        description: item.description,
        pieceCount: item.pieceCount,
        palletCount: item.palletCount,
        weight: item.weight,
        weightType: 1, // lbs
        productClass: item.productClass,
        packageType: item.packageType,
        hazmat: item.hazmat,
        stackable: item.stackable,
        length: item.length || undefined,
        width: item.width || undefined,
        height: item.height || undefined,
        nmfcNumber: item.nmfcNumber || undefined,
      })),
      accessorials: accessorials.length > 0 ? accessorials : undefined,
    }

    setCurrentMainStep("choose-carrier")

    try {
      const result = await fetchCarrierRates(payload)
      if (result.success && result.data) {
        setCarrierRatesError(null)
        setCarrierRates(result.data)
      } else {
        setCarrierRates([])
        setCarrierRatesError(
          (result as { error?: string }).error ||
          'No rates returned. Please verify your shipment details.'
        )
      }
    } catch (err: unknown) {
      setCarrierRates([])
      let message = 'Failed to get carrier rates. Please check your shipment details and try again.'
      if (err instanceof Error) {
        const axiosErr = err as Error & {
          response?: { data?: { error?: string; message?: string } }
        }
        message =
          axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          err.message ||
          message
      }
      setCarrierRatesError(message)
    }
  }

  const handleFinalizeSuccessDialogBack = () => {
    setShowFinalizeSuccessDialog(false)
    // Stay on finalize step
  }

  const handleFinalizeSuccessDialogNext = () => {
    setShowFinalizeSuccessDialog(false)
    setCurrentMainStep("payment")
  }

  // --- Stripe return: restore state & navigate to payment step ---
  //
  // Triggered by the `stripeReturnType` prop set by QuoteForm's useLayoutEffect.
  // Using a prop (instead of bookingStore.isReturnFromStripe) avoids the Zustand
  // v5 persist-middleware hydration race: hydration runs as a microtask and would
  // override the Zustand flag before this useEffect fires.
  //
  // By the time useEffect runs (after the browser paint), Zustand's persist
  // middleware has fully hydrated — all store values are correct and safe to read.
  useEffect(() => {
    if (!stripeReturnType) return

    // Read from the fully-hydrated store using getState() (synchronous, no stale
    // closure issues since we're not inside a Zustand subscription callback)
    const store = useBookingStore.getState()

    // Restore UI state
    if (store.carrierRates.length > 0) setCarrierRates(store.carrierRates)
    if (store.selectedCarrierQuoteId) setSelectedCarrier(store.selectedCarrierQuoteId)
    if (store.userEmail) setUserEmail(store.userEmail)
    if (store.isEmailVerified) setIsEmailVerified(true)

    // Restore form snapshot so watch() returns real values (weight, zips, items…)
    // when the user retries payment — this is what fixes "items.0.weight undefined"
    if (store.formSnapshot) {
      const snap = store.formSnapshot
      reset(
        {
          pickup: snap.pickup,
          delivery: snap.delivery,
          items: snap.items,
        } as BookingFormValues,
        { keepDefaultValues: false }
      )
    }

    // Navigate to the payment step
    setCurrentMainStep("payment")

    if (stripeReturnType === 'cancelled') {
      // Mark as cancelled so the "Payment was cancelled" banner shows
      store.setPaymentStatus('cancelled')
      return
    }

    // Success: verify the Stripe session
    const sessionId = store.paymentSessionId
    if (!sessionId) {
      store.setPaymentStatus('failed')
      return
    }

    const verifyPayment = async () => {
      setIsVerifyingPayment(true)
      try {
        const res = await fetch(CHECKOUT_API_ENDPOINTS.VERIFY_SESSION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
        const json = await res.json()
        if (res.ok && json.success && json.data?.paid) {
          store.setPaymentStatus("success")
          // Show warnings for any backend save issues (Odoo / email)
          const saveErrors: string[] | undefined = json.data.saveErrors
          if (saveErrors && saveErrors.length > 0) {
            for (const msg of saveErrors) {
              toast({
                title: "Notice",
                description: msg,
                variant: "destructive",
              })
            }
          }
        } else {
          store.setPaymentStatus("failed")
          toast({
            title: "Payment verification failed",
            description: "Please contact support if you were charged.",
            variant: "destructive",
          })
        }
      } catch {
        store.setPaymentStatus("failed")
        toast({
          title: "Payment verification failed",
          description: "A network error occurred. Please contact support.",
          variant: "destructive",
        })
      } finally {
        setIsVerifyingPayment(false)
      }
    }
    verifyPayment()
  // stripeReturnType is set once (null → 'success'|'cancelled') and never changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripeReturnType])

  // --- bfcache restore: reset isPaying so the Pay button is not stuck loading ---
  //
  // When the browser back-forward cache (bfcache) restores the page, React state
  // is frozen in place including isPaying:true (set just before the Stripe
  // redirect and never reset on success path). We listen for the `pageshow` event
  // with persisted:true to detect this and unblock the button.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return
      setIsPaying(false)
      // If payment was still "pending" when navigation happened, treat it as
      // cancelled so the user sees the "Payment was cancelled" retry banner.
      const store = useBookingStore.getState()
      if (store.paymentStatus === 'pending') store.setPaymentStatus('cancelled')
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  // --- Pay: create checkout session & redirect to Stripe ---
  const handlePay = useCallback(async () => {
    const rate = carrierRates.find((r) => r.quoteId === selectedCarrier)
    if (!rate) return

    setIsPaying(true)
    setPayError(null)
    // Clear any previous status so stale banners don't persist while loading
    bookingStore.setPaymentStatus("idle")

    try {
      const formData = watch()
      // On retry after browser-back, watch() returns the values restored by reset()
      // in the stripeReturnType useEffect. As a belt-and-suspenders fallback, if
      // an item's weight is still undefined (e.g. reset() hasn't propagated yet),
      // pull the item data from the persisted formSnapshot which was saved right
      // before the original redirect — it always has a valid weight number.
      const store = useBookingStore.getState()
      const itemsToSend =
        formData.items?.length > 0 && formData.items[0].weight !== undefined
          ? formData.items
          : (store.formSnapshot?.items as typeof formData.items | undefined) ?? formData.items

      const res = await fetch(CHECKOUT_API_ENDPOINTS.CREATE_SESSION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrierName: rate.carrierName,
          carrierCode: rate.carrierCode,
          quoteId: rate.quoteId,
          totalRate: rate.totalRate,
          charges: rate.charges,
          transitDays: rate.transitDays,
          estimatedDeliveryDate: rate.estimatedDeliveryDate,
          serviceType: rate.serviceType,
          email: userEmail,
          pickup: formData.pickup,
          delivery: formData.delivery,
          items: itemsToSend,
        }),
      })

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After")
        const seconds = retryAfter ? parseInt(retryAfter, 10) : 60
        throw new Error(
          `Too many requests. Please wait ${seconds} second${seconds !== 1 ? "s" : ""} and try again.`
        )
      }

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Failed to create payment session. Please try again.")
      }

      const { sessionUrl, sessionId, bookingId } = json.data

      // Persist everything before navigating away (use itemsToSend — the
      // validated source that always has a numeric weight)
      bookingStore.saveBeforeRedirect({
        formSnapshot: {
          pickup: formData.pickup as unknown as Record<string, unknown>,
          delivery: formData.delivery as unknown as Record<string, unknown>,
          items: itemsToSend as unknown as Record<string, unknown>[],
        },
        selectedCarrierQuoteId: rate.quoteId,
        carrierRates,
        userEmail,
        isEmailVerified,
        paymentSessionId: sessionId,
        bookingId,
      })

      // Redirect to Stripe
      window.location.href = sessionUrl
    } catch (err) {
      setIsPaying(false)
      setPayError(err instanceof Error ? err.message : "Failed to initiate payment. Please try again.")
    }
  }, [carrierRates, selectedCarrier, userEmail, isEmailVerified, watch, bookingStore])

  // --- After successful payment, submit booking ---
  const handleSubmitBooking = useCallback(() => {
    setShowPaymentSuccessDialog(true)
  }, [])

  const renderCurrentStep = () => {
    if (currentMainStep === "order-details") {
      if (currentSubStep === "items") {
        if (currentItemMicroStep === "details") {
          return (
            <ItemStep
              itemIndex={currentItemIndex}
              register={register}
              errors={errors}
              setValue={setValue}
            />
          )
        } else if (currentItemMicroStep === "conditions") {
          return (
            <ItemConditionsStep
              itemIndex={currentItemIndex}
              setValue={setValue}
              watch={watch}
            />
          )
        }
      } else if (currentMicroStep === "type") {
        return (
          <LocationTypeStep
            value={currentSubStep === "pickup" ? pickupType : deliveryType}
            onChange={(type: LocationType) => {
              setValue(`${currentSubStep}.type`, type)
            }}
            stepType={currentSubStep === "pickup" ? "Pickup" : "Delivery"}
          />
        )
      } else if (currentMicroStep === "where-when") {
        return (
          <WhereAndWhenStep
            stepType={currentSubStep === "pickup" ? "Pickup" : "Delivery"}
            register={register}
            errors={errors}
            fieldPrefix={currentSubStep}
            setValue={setValue}
            watch={watch}
          />
        )
      } else if (currentMicroStep === "additional-services") {
        return (
          <AdditionalServicesStep
            stepType={currentSubStep === "pickup" ? "Pickup" : "Delivery"}
            setValue={setValue}
            watch={watch}
            fieldPrefix={currentSubStep}
          />
        )
      }
    }

    // Choose Carrier Step
    if (currentMainStep === "choose-carrier") {
      return (
        <ChooseCarrierStep
          rates={carrierRates}
          pickupDate={watch("pickup.pickupDate")}
          isLoading={isLoadingRates}
          error={carrierRatesError ?? undefined}
          onSelectRate={(quoteId) => {
            setSelectedCarrier(quoteId)
            setCurrentMainStep("finalize")
          }}
          onGoBack={() => {
            setCarrierRatesError(null)
            setCarrierRates([])
            setCurrentMainStep("order-details")
          }}
        />
      )
    }

    // Finalize Step
    if (currentMainStep === "finalize") {
      return (
        <FinalizeStep
          email={userEmail}
          onEmailChange={setUserEmail}
          onOtpChange={setEnteredOtp}
          onSendOtp={handleSendOtp}
          otpError={otpError}
          isVerifying={isVerifyingOtp}
          isSendingOtp={isSendingOtp}
          otpSent={otpSent}
          isEmailVerified={isEmailVerified}
        />
      )
    }

    // Payment Step
    if (currentMainStep === "payment") {
      return (
        <PaymentStep
          rate={carrierRates.find((r) => r.quoteId === selectedCarrier) ?? null}
          pickupDate={watch("pickup.pickupDate")}
          email={userEmail}
          paymentStatus={bookingStore.paymentStatus}
          isPaying={isPaying}
          isVerifyingPayment={isVerifyingPayment}
          payError={payError}
          onPay={handlePay}
          onSubmitBooking={handleSubmitBooking}
        />
      )
    }

    // Placeholder for other steps
    return (
      <div className="text-center py-12">
        <p className="text-[#666666] font-poppins">This step is coming soon...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#FBFBFB] p-2 sm:p-4 md:p-8 overflow-auto">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto flex flex-col min-h-full">
        {/* Stepper */}
        <div className="flex-shrink-0 mb-4 sm:mb-6">
          <BookingStepper currentStep={getCurrentStepNumber()} steps={steps} />
        </div>

        {/* Content Area */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 flex-1">
          {/* Sidebar */}
          <div className="flex-shrink-0 w-full lg:w-80">
            <BookingSidebar
              currentMainStep={currentMainStep}
              currentSubStep={currentSubStep}
              currentMicroStep={currentMicroStep}
              onNavigate={handleNavigation}
              completedPickupSteps={completedPickupSteps}
              completedDeliverySteps={completedDeliverySteps}
              completedItems={completedItems}
              itemsCount={watch("items")?.length || 0}
              currentItemIndex={currentItemIndex}
              formData={watch()}
              selectedCarrier={selectedCarrier}
              enteredOtp={enteredOtp}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-[#E0E0E0] flex flex-col">
              {/* Step Content */}
              <div className="flex-1 overflow-y-auto mb-6 sm:mb-8 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-280px)] lg:max-h-[calc(100vh-250px)]">{renderCurrentStep()}</div>

              {/* Help Section - Hidden for Payment Step */}
              {currentMainStep !== "payment" && (
              <div className="flex-shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between flex-wrap gap-3 sm:gap-4 py-3 sm:py-4 border-t border-[#E0E0E0]">
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#666666]">
                  <span className="font-poppins">Need help?</span>
                  <span className="font-poppins">Contact Support at</span>
                  <a
                    href="tel:+14794507010"
                    className="font-poppins font-semibold text-[--text-primary] hover:text-[--brand-primary] flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    +1 479-450-7010
                  </a>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  {currentSubStep === "items" && currentItemMicroStep === "conditions" && (
                    <Button
                      type="button"
                      onClick={handleAddAnotherItem}
                      variant="outline"
                      className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 h-9 sm:h-11 rounded-lg border-2 border-[--brand-primary] text-[--brand-primary] font-poppins text-xs sm:text-sm font-medium hover:bg-[#E8F5ED]"
                    >
                      Add Another Item
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 sm:flex-initial px-6 sm:px-8 py-2 h-9 sm:h-11 rounded-lg border-2 border-[#E0E0E0] text-[--text-primary] font-poppins text-xs sm:text-sm font-medium hover:bg-gray-50"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting || isVerifyingOtp}
                    className="flex-1 sm:flex-initial px-6 sm:px-8 py-2 h-9 sm:h-11 btn-gradient-green text-white font-poppins text-xs sm:text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-60"
                  >
                    {isVerifyingOtp ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying…
                      </span>
                    ) : (
                      "Next"
                    )}
                  </Button>
                </div>
              </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <OrderDetailsSuccessDialog
        open={showSuccessDialog}
        onBack={handleSuccessDialogBack}
        onChooseCarrier={handleSuccessDialogChooseCarrier}
        onClose={() => setShowSuccessDialog(false)}
      />

      {/* Finalize Success Dialog */}
      <FinalizeSuccessDialog
        open={showFinalizeSuccessDialog}
        onBack={handleFinalizeSuccessDialogBack}
        onNext={handleFinalizeSuccessDialogNext}
        onClose={() => setShowFinalizeSuccessDialog(false)}
      />

      {/* Payment Success Dialog */}
      <PaymentSuccessDialog
        open={showPaymentSuccessDialog}
        onClose={() => setShowPaymentSuccessDialog(false)}
        onComplete={() => {
          setShowPaymentSuccessDialog(false)
          bookingStore.clearBookingStore()
          onClose()
        }}
      />
    </div>
  )
}
