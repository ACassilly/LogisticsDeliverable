"use client"

import { cn } from "@/lib/utils"
import { CircleCheckBig } from "lucide-react"
import type { BookingStep, OrderDetailsSubStep, DetailsMicroStep } from "@/types/booking.types"
import type { BookingFormValues } from "@/validations/booking.validation"

interface BookingSidebarProps {
  currentMainStep: BookingStep
  currentSubStep: OrderDetailsSubStep
  currentMicroStep: DetailsMicroStep
  onNavigate: (
    mainStep: BookingStep,
    subStep?: OrderDetailsSubStep,
    microStep?: DetailsMicroStep,
    itemIndex?: number
  ) => void
  completedPickupSteps: DetailsMicroStep[]
  completedDeliverySteps: DetailsMicroStep[]
  completedItems?: number[]
  itemsCount?: number
  currentItemIndex?: number
  formData?: Partial<BookingFormValues>
  selectedCarrier?: string | null
  enteredOtp?: string
}

export function BookingSidebar({
  currentMainStep,
  currentSubStep,
  onNavigate,
  completedPickupSteps,
  completedDeliverySteps,
  completedItems = [],
  itemsCount = 0,
  currentItemIndex = 0,
  formData = {},
  selectedCarrier = null,
  enteredOtp = "",
}: BookingSidebarProps) {
  const isPickupCompleted = completedPickupSteps.length === 3
  const isDeliveryCompleted = completedDeliverySteps.length === 3
  const hasCompletedItems = completedItems.length > 0

  // Helper function to format location type
  const formatLocationType = (type: string) => {
    if (!type) return "Type"
    return type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")
  }

  // Helper function to format date
  const formatDate = (date: string) => {
    if (!date) return null
    // Convert YYYY-MM-DD to MM-DD-YY format
    const dateObj = new Date(date)
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    const year = String(dateObj.getFullYear()).slice(-2)
    return `Dated (${month}-${day}-${year})`
  }

  // Get pickup data
  const pickupType = formData?.pickup?.type
  const pickupZip = formData?.pickup?.zip
  const pickupCity = formData?.pickup?.city
  const pickupState = formData?.pickup?.state
  const pickupLocation = [pickupCity, pickupState, pickupZip].filter(Boolean).join(", ")
  const pickupDate = formData?.pickup?.pickupDate
  const hasPickupServices = formData?.pickup?.liftgateRequired || 
                           formData?.pickup?.insidePickup || 
                           formData?.pickup?.appointmentRequired

  // Get delivery data
  const deliveryType = formData?.delivery?.type
  const deliveryZip = formData?.delivery?.zip
  const deliveryCity = formData?.delivery?.city
  const deliveryState = formData?.delivery?.state
  const deliveryLocation = [deliveryCity, deliveryState, deliveryZip].filter(Boolean).join(", ")
  const hasDeliveryServices = formData?.delivery?.liftgateRequired || 
                             formData?.delivery?.insideDelivery || 
                             formData?.delivery?.appointmentRequired ||
                             formData?.delivery?.notifyReceiverPriorToDelivery

  return (
    <div className="w-full bg-[#FAFAFA] rounded-xl sm:rounded-2xl border-2 border-[#F1F1F1] flex flex-col max-h-[calc(100vh-200px)] lg:max-h-[calc(100vh-180px)]">
      {/* Overview Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#FAFAFA] border-2 border-[#F1F1F1] flex-shrink-0">
        <h3 className="font-poppins bg-[#FAFAFA] text-sm sm:text-base font-medium text-[--text-primary]">
          Overview
        </h3>
      </div>

      {/* Navigation */}
      <nav className="p-4 sm:p-6 space-y-2 sm:space-y-3 overflow-y-auto flex-1">
        {/* Order Details Section */}
        <div className="relative">
          {/* Vertical Line */}
          {currentMainStep === "order-details" && (
            <div className="absolute left-2 top-8 bottom-0 w-[2px] bg-[#E0E0E0]" />
          )}
          
          <button
            className={cn(
              "w-full text-left px-0 py-1 font-poppins text-sm sm:text-base font-medium transition-colors",
              currentMainStep === "order-details"
                ? "text-[--text-primary]"
                : "text-[#999999] hover:text-[--text-primary]"
            )}
            onClick={() => onNavigate("order-details", "pickup", "type")}
          >
            Order Details
          </button>

          {/* Sub-sections only show when Order Details is active */}
          {currentMainStep === "order-details" && (
            <div className="mt-3 space-y-3 pl-6 relative">
              {/* Pickup Section */}
              <div className="relative">
                {/* Connecting line dot */}
                <div className="absolute -left-[19px] top-2 w-2 h-2 rounded-full bg-[#E0E0E0]" />
                
                <button
                  className={cn(
                    "w-full text-left font-poppins text-base transition-colors flex items-center justify-between",
                    currentSubStep === "pickup"
                      ? "text-[--text-primary] font-medium"
                      : "text-[#666666] hover:text-[--text-primary]"
                  )}
                  onClick={() => onNavigate("order-details", "pickup", "type")}
                >
                  <span>Pickup</span>
                  {isPickupCompleted && (
                    <CircleCheckBig className="w-4 h-4 text-[--brand-primary]" />
                  )}
                </button>

                {/* Pickup Details - Show filled data */}
                {(completedPickupSteps.length > 0 || currentSubStep === "pickup") && (
                  <div className="mt-2 space-y-1.5 text-sm relative pl-4">
                    {/* Dotted vertical line for micro-step data */}
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] border-l border-dashed border-[#D0D0D0]" />
                    
                    {/* Location Type */}
                    {pickupType && (
                      <div className="font-poppins text-[#666666] relative">
                        <div className="absolute -left-[17px] top-2 w-1.5 h-1.5 rounded-full bg-[#D0D0D0]" />
                        {formatLocationType(pickupType)}
                      </div>
                    )}
                    
                    {/* City/Address */}
                    {pickupLocation && (
                      <div className="font-poppins text-[#666666] relative">
                        <div className="absolute -left-[17px] top-2 w-1.5 h-1.5 rounded-full bg-[#D0D0D0]" />
                        {pickupLocation}
                      </div>
                    )}
                    
                    {/* Date */}
                    {pickupDate && (
                      <div className="font-poppins text-[#999999] text-xs relative">
                        <div className="absolute -left-[17px] top-1.5 w-1.5 h-1.5 rounded-full bg-[#D0D0D0]" />
                        {formatDate(pickupDate)}
                      </div>
                    )}
                    
                    {/* Additional Services Link */}
                    {hasPickupServices && (
                      <button
                        onClick={() => onNavigate("order-details", "pickup", "additional-services")}
                        className="font-poppins text-[--brand-primary] text-sm hover:underline relative"
                      >
                        <div className="absolute -left-[17px] top-2 w-1.5 h-1.5 rounded-full bg-[#D0D0D0]" />
                        Additional Services
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Section */}
              <div className="relative">
                {/* Connecting line dot */}
                <div className="absolute -left-[19px] top-2 w-2 h-2 rounded-full bg-[#E0E0E0]" />
                
                <button
                  className={cn(
                    "w-full text-left font-poppins text-base transition-colors flex items-center justify-between",
                    currentSubStep === "delivery"
                      ? "text-[--text-primary] font-medium"
                      : isPickupCompleted
                      ? "text-[#666666] hover:text-[--text-primary]"
                      : "text-[#CCCCCC] cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (isPickupCompleted) {
                      onNavigate("order-details", "delivery", "type")
                    }
                  }}
                  disabled={!isPickupCompleted}
                >
                  <span>Delivery</span>
                  {isDeliveryCompleted && (
                    <CircleCheckBig className="w-4 h-4 text-[--brand-primary]" />
                  )}
                </button>

                {/* Delivery Details - Show filled data */}
                {(completedDeliverySteps.length > 0 || currentSubStep === "delivery") && (
                  <div className="mt-2 space-y-1.5 text-sm relative pl-4">
                    {/* Dotted vertical line for micro-step data */}
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] border-l border-dashed border-[#D0D0D0]" />
                    
                    {/* Location Type */}
                    {deliveryType && (
                      <div className="font-poppins text-[#666666] relative">
                        <div className="absolute -left-[17px] top-2 w-1.5 h-1.5 rounded-full bg-[#D0D0D0]" />
                        {formatLocationType(deliveryType)}
                      </div>
                    )}
                    
                    {/* City/Address */}
                    {deliveryLocation && (
                      <div className="font-poppins text-[#666666] relative">
                        <div className="absolute -left-[17px] top-2 w-1.5 h-1.5 rounded-full bg-[#D0D0D0]" />
                        {deliveryLocation}
                      </div>
                    )}
                    
                    {/* Additional Services Link */}
                    {hasDeliveryServices && (
                      <button
                        onClick={() => onNavigate("order-details", "delivery", "additional-services")}
                        className="font-poppins text-[--brand-primary] text-sm hover:underline relative"
                      >
                        <div className="absolute -left-[17px] top-2 w-1.5 h-1.5 rounded-full bg-[#D0D0D0]" />
                        Additional Services
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Items Section */}
              {itemsCount > 0 && (
                <div className="space-y-2 relative">
                  {Array.from({ length: itemsCount }, (_, index) => {
                    const isItemCompleted = completedItems.includes(index)
                    const isItemActive = currentSubStep === "items" && currentItemIndex === index
                    const canNavigate = isDeliveryCompleted || isItemCompleted

                    return (
                      <div key={index} className="relative">
                        {/* Connecting line dot */}
                        <div className="absolute -left-[19px] top-2 w-2 h-2 rounded-full bg-[#E0E0E0]" />
                        
                        <button
                          className={cn(
                            "w-full text-left font-poppins text-base transition-colors flex items-center justify-between",
                            isItemActive
                              ? "text-[--text-primary] font-medium"
                              : canNavigate
                              ? "text-[#666666] hover:text-[--text-primary]"
                              : "text-[#CCCCCC] cursor-not-allowed"
                          )}
                          onClick={() => {
                            if (canNavigate) {
                              onNavigate("order-details", "items", undefined, index)
                            }
                          }}
                          disabled={!canNavigate}
                        >
                          <span>Item {index + 1}</span>
                          {isItemCompleted && (
                            <CircleCheckBig className="w-4 h-4 text-[--brand-primary]" />
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Choose Carrier */}
        <div className="relative">
          {/* Vertical Line */}
          {currentMainStep === "choose-carrier" && (
            <div className="absolute left-2 top-8 bottom-0 w-[2px] bg-[#E0E0E0]" />
          )}
          
          <button
            className={cn(
              "w-full text-left px-0 py-1 font-poppins text-base font-medium transition-colors flex items-center justify-between",
              currentMainStep === "choose-carrier"
                ? "text-[--text-primary]"
                : isPickupCompleted && isDeliveryCompleted && hasCompletedItems
                ? "text-[#999999] hover:text-[--text-primary]"
                : "text-[#CCCCCC] cursor-not-allowed"
            )}
            onClick={() => {
              if (isPickupCompleted && isDeliveryCompleted && hasCompletedItems) {
                onNavigate("choose-carrier")
              }
            }}
            disabled={!isPickupCompleted || !isDeliveryCompleted || !hasCompletedItems}
          >
            <span>Choose Carrier</span>
            {selectedCarrier && (
              <CircleCheckBig className="w-4 h-4 text-[--brand-primary]" />
            )}
          </button>

          {/* Sub-item when active */}
          {currentMainStep === "choose-carrier" && (
            <div className="mt-3 pl-6 relative">
              <div className="absolute -left-[13px] top-2 w-2 h-2 rounded-full bg-[#E0E0E0]" />
              <div className="font-poppins text-sm text-[--brand-primary]">
                Select Rate
              </div>
            </div>
          )}
        </div>

        {/* Finalize */}
        <div className="relative">
          {/* Vertical Line */}
          {currentMainStep === "finalize" && (
            <div className="absolute left-2 top-8 bottom-0 w-[2px] bg-[#E0E0E0]" />
          )}
          
          <button
            className={cn(
              "w-full text-left px-0 py-1 font-poppins text-base font-medium transition-colors flex items-center justify-between",
              currentMainStep === "finalize"
                ? "text-[--text-primary]"
                : currentMainStep === "payment"
                ? "text-[#999999] hover:text-[--text-primary]"
                : "text-[#CCCCCC] cursor-not-allowed"
            )}
            onClick={() => {
              if (currentMainStep === "payment") {
                onNavigate("finalize")
              }
            }}
            disabled={currentMainStep !== "finalize" && currentMainStep !== "payment"}
          >
            <span>Finalize</span>
            {enteredOtp && enteredOtp.length === 6 && (
              <CircleCheckBig className="w-4 h-4 text-[--brand-primary]" />
            )}
          </button>

          {/* Sub-item when active */}
          {currentMainStep === "finalize" && (
            <div className="mt-3 pl-6 relative">
              <div className="absolute -left-[13px] top-2 w-2 h-2 rounded-full bg-[#E0E0E0]" />
              <div className="font-poppins text-sm text-[--brand-primary]">
                Enter Code
              </div>
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="relative">
          {/* Vertical Line */}
          {currentMainStep === "payment" && (
            <div className="absolute left-2 top-8 bottom-0 w-[2px] bg-[#E0E0E0]" />
          )}
          
          <button
            className={cn(
              "w-full text-left px-0 py-1 font-poppins text-base font-medium transition-colors",
              currentMainStep === "payment"
                ? "text-[--text-primary]"
                : "text-[#CCCCCC] cursor-not-allowed"
            )}
            disabled={currentMainStep !== "payment"}
          >
            Payment
          </button>

          {/* Sub-item when active */}
          {currentMainStep === "payment" && (
            <div className="mt-3 pl-6 relative">
              <div className="absolute -left-[13px] top-2 w-2 h-2 rounded-full bg-[#E0E0E0]" />
              <div className="font-poppins text-sm text-[--brand-primary]">
                Complete Payment
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
