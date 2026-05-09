"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface OrderDetailsSuccessDialogProps {
  open: boolean
  onBack: () => void
  onChooseCarrier: () => void
  onClose: () => void
}

export function OrderDetailsSuccessDialog({
  open,
  onBack,
  onChooseCarrier,
  onClose,
}: OrderDetailsSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md p-6 sm:p-8 rounded-2xl sm:rounded-3xl">
        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Heading with Emojis */}
          <DialogTitle className="font-syne text-lg sm:text-xl md:text-2xl font-bold text-[--text-primary] mb-2">
            Congrats! Your order details are done and dusted,{" "}
            <span className="text-[--brand-primary]">we are just there!!!</span>
          </DialogTitle>

          {/* Success Icon */}
          <div className="relative my-6 sm:my-8">
            {/* Outer circle - light green background */}
            <div className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-[#E8F5ED]/50 blur-2xl" />
            
            {/* Middle circle - lighter green */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#C8E6D7] to-[#E8F5ED] flex items-center justify-center">
              {/* Inner circle - green with check */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#3BAB6B] to-[#4BC57D] flex items-center justify-center shadow-lg">
                <Check className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white stroke-[3]" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 sm:gap-4 w-full">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="flex-1 px-4 sm:px-8 py-2 sm:py-3 h-10 sm:h-12 rounded-full border-2 border-[#E0E0E0] text-[--text-primary] font-poppins text-sm sm:text-base font-medium hover:bg-gray-50"
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={onChooseCarrier}
              className="flex-1 px-4 sm:px-8 py-2 sm:py-3 h-10 sm:h-12 btn-gradient-green text-white font-poppins text-sm sm:text-base font-semibold rounded-full hover:opacity-90"
            >
              Choose carrier
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
