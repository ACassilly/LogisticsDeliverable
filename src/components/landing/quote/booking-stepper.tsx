"use client"

import { cn } from "@/lib/utils"

interface Step {
  number: number
  label: string
  isActive: boolean
  isCompleted: boolean
}

interface BookingStepperProps {
  currentStep: number
  steps: Step[]
}

export function BookingStepper({ currentStep, steps }: BookingStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 mb-6 sm:mb-8 md:mb-12 overflow-x-auto px-2">
      {steps.map((step, index) => {
        // A step is completed if its number is less than the current step
        const isCompleted = step.number < currentStep || step.isCompleted
        const isActive = step.number === currentStep || step.isActive
        
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              {/* Step Circle */}
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-poppins font-medium transition-all",
                  isActive
                    ? "bg-[#3BAB6B] text-white border-2 border-[#3BAB6B]"
                    : isCompleted
                    ? "bg-[#3BAB6B] text-white border-2 border-[#3BAB6B] shadow-md"
                    : "bg-[#E3E3E3] text-[#999999] border-2 border-[#E3E3E3]",
                  isCompleted ? "text-lg sm:text-xl md:text-2xl" : "text-xs sm:text-sm md:text-base"
                )}
              >
                {isCompleted ? "✓" : step.number}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  "text-[10px] sm:text-xs md:text-sm font-poppins font-normal text-center whitespace-nowrap",
                  isActive ? "text-[#3BAB6B]" : "text-[#999999]"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line - Don't show after last step */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "hidden sm:block w-8 md:w-16 lg:w-24 h-[2px] mx-2 sm:mx-3 md:mx-4",
                  isCompleted ? "bg-[#3BAB6B]" : "bg-[#E3E3E3]"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
