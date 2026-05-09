"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface FinalizeSuccessDialogProps {
  open: boolean
  onBack: () => void
  onNext: () => void
  onClose: () => void
}

export function FinalizeSuccessDialog({
  open,
  onBack,
  onNext,
  onClose,
}: FinalizeSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-md bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-none">
        {/* Content */}
        <div className="flex flex-col items-center text-center">
          {/* Message */}
          <DialogTitle className="font-syne text-lg sm:text-xl md:text-2xl font-bold text-[--text-primary] mb-4 sm:mb-6">
            Yeeeeyh!!, we have all the requirements,{" "}
            <span className="text-[--brand-primary]">
              1 final step and lets ship!!!
            </span>
          </DialogTitle>

          {/* Emoji Illustration */}
          <div className="relative mb-6 sm:mb-8">
            {/* Outer circle - light green */}
            <div className="absolute inset-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-[#E8F5ED]/50 blur-2xl" />
            
            {/* Middle circle - lighter green */}
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#C8E6D7] to-[#E8F5ED] flex items-center justify-center">
              {/* Inner circle - yellow/gold */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#FFC107] to-[#FFD54F] flex items-center justify-center shadow-lg">
                {/* Emoji Face */}
                <div className="text-4xl sm:text-5xl md:text-6xl">😁</div>
              </div>

              {/* Celebration elements - Left confetti */}
              <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl md:text-4xl animate-bounce">
                🎉
              </div>

              {/* Celebration elements - Right confetti */}
              <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl md:text-4xl animate-bounce" style={{ animationDelay: "0.2s" }}>
                🎉
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 w-full">
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1 h-10 sm:h-12 rounded-full border-2 border-[#E0E0E0] text-[--text-primary] font-poppins font-medium hover:bg-gray-50 text-sm sm:text-base"
            >
              Back
            </Button>
            <Button
              onClick={onNext}
              className="flex-1 h-10 sm:h-12 rounded-full btn-gradient-green text-white font-poppins font-semibold hover:opacity-90 text-sm sm:text-base"
            >
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
