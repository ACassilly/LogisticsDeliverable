"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { BookingForm } from "./booking-form"
import type { QuoteFormData } from "@/validations/quote.validation"

interface BookingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Passed from QuoteForm when it detects a Stripe return; forwarded to BookingForm. */
  stripeReturnType?: 'success' | 'cancelled' | null
  /** Quote form data for pre-populating booking fields. */
  quoteData?: QuoteFormData
}

export function BookingDialog({ open, onOpenChange, stripeReturnType, quoteData }: BookingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-full max-h-screen h-screen p-0 bg-transparent border-none overflow-hidden">
        <DialogTitle className="sr-only">Booking Form</DialogTitle>
        <BookingForm onClose={() => onOpenChange(false)} stripeReturnType={stripeReturnType} quoteData={quoteData} />
      </DialogContent>
    </Dialog>
  )
}
