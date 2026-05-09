"use client"

import { useEffect, useRef } from "react"
import { useBookingStore } from "@/store"

/**
 * PaymentReturnHandler
 *
 * Mounted alongside QuoteForm on the /quote page. After a Stripe redirect,
 * the URL will contain either `?session_id=…` (success) or
 * `?payment_cancelled=true`. This component:
 *  1. Detects the URL params
 *  2. Updates the booking store with the return status
 *  3. Cleans the URL (replaceState) so a refresh doesn't re-trigger
 *
 * The BookingForm's mount useEffect will pick up `isReturnFromStripe` and
 * open the dialog + restore state from the Zustand sessionStorage store.
 */
export function PaymentReturnHandler({
  onOpenBookingDialog,
}: {
  onOpenBookingDialog: () => void
}) {
  const hasRun = useRef(false)
  const setPaymentStatus = useBookingStore((s) => s.setPaymentStatus)
  const setIsReturnFromStripe = useBookingStore((s) => s.setIsReturnFromStripe)
  const paymentSessionId = useBookingStore((s) => s.paymentSessionId)

  useEffect(() => {
    if (hasRun.current) return
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get("session_id")
    const cancelled = params.get("payment_cancelled")

    if (!sessionId && !cancelled) return
    // Only process if we have a pending booking in the store
    if (!paymentSessionId) return

    hasRun.current = true

    if (cancelled) {
      setPaymentStatus("cancelled")
    }
    // If session_id is present, the booking-form will verify it on mount
    setIsReturnFromStripe(true)

    // Clean URL
    const url = new URL(window.location.href)
    url.searchParams.delete("session_id")
    url.searchParams.delete("payment_cancelled")
    window.history.replaceState({}, "", url.pathname)

    // Open the booking dialog so the user sees payment-step
    onOpenBookingDialog()
  }, [paymentSessionId, setPaymentStatus, setIsReturnFromStripe, onOpenBookingDialog])

  return null
}
