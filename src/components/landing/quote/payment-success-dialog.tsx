"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PaymentSuccessDialogProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
}

export function PaymentSuccessDialog({
  open,
  onClose,
  onComplete,
}: PaymentSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-none">
        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Message */}
          <DialogTitle className="font-syne text-lg sm:text-xl md:text-2xl font-bold text-[--text-primary] mb-4 sm:mb-6">
            Payment Confirmed!{" "}
            <span className="text-[--brand-primary]">
              Your booking has been submitted. We&apos;ll send a confirmation email shortly.
            </span>
          </DialogTitle>

          {/* Box Illustration */}
          <div className="relative mb-6 sm:mb-8">
            {/* Outer circle - light green */}
            <div className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-[#E8F5ED]/50 blur-2xl" />
            
            {/* Middle circle - lighter green */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#C8E6D7] to-[#E8F5ED] flex items-center justify-center">
              {/* Inner circle - beige/cream */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#F5E6D3] to-[#FFE5B4] flex items-center justify-center shadow-lg">
                {/* Package/Box Icon */}
                <div className="text-4xl sm:text-5xl md:text-6xl">📦</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 w-full">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-10 sm:h-12 rounded-full border-2 border-[#E0E0E0] text-[--text-primary] font-poppins font-medium hover:bg-gray-50 text-sm sm:text-base"
            >
              Back
            </Button>
            <Button
              onClick={onComplete}
              className="flex-1 h-10 sm:h-12 rounded-full btn-gradient-green text-white font-poppins font-semibold hover:opacity-90 text-sm sm:text-base"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
