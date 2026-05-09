/**
 * Booking Store — Zustand with sessionStorage persistence
 *
 * Survives the Stripe redirect/return cycle by persisting all critical
 * booking state to sessionStorage (cleared when tab closes).
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { AllCarrierRate } from '@/types/quote.types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PaymentStatus =
  | 'idle'
  | 'pending'
  | 'success'
  | 'cancelled'
  | 'failed'

export interface BookingFormSnapshot {
  pickup: Record<string, unknown>
  delivery: Record<string, unknown>
  items: Record<string, unknown>[]
}

interface BookingState {
  // Form data snapshot (taken right before Stripe redirect)
  formSnapshot: BookingFormSnapshot | null
  // Selected carrier info
  selectedCarrierQuoteId: string | null
  carrierRates: AllCarrierRate[]
  // User info
  userEmail: string
  isEmailVerified: boolean
  // Stripe
  paymentSessionId: string | null
  paymentStatus: PaymentStatus
  bookingId: string | null
  // Flags
  isReturnFromStripe: boolean
}

interface BookingActions {
  /** Snapshot everything before redirecting to Stripe */
  saveBeforeRedirect: (data: {
    formSnapshot: BookingFormSnapshot
    selectedCarrierQuoteId: string
    carrierRates: AllCarrierRate[]
    userEmail: string
    isEmailVerified: boolean
    paymentSessionId: string
    bookingId: string
  }) => void
  setPaymentStatus: (status: PaymentStatus) => void
  setIsReturnFromStripe: (val: boolean) => void
  clearBookingStore: () => void
}

type BookingStore = BookingState & BookingActions

const initialState: BookingState = {
  formSnapshot: null,
  selectedCarrierQuoteId: null,
  carrierRates: [],
  userEmail: '',
  isEmailVerified: false,
  paymentSessionId: null,
  paymentStatus: 'idle',
  bookingId: null,
  isReturnFromStripe: false,
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useBookingStore = create<BookingStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        saveBeforeRedirect: (data) => {
          set(
            {
              formSnapshot: data.formSnapshot,
              selectedCarrierQuoteId: data.selectedCarrierQuoteId,
              carrierRates: data.carrierRates,
              userEmail: data.userEmail,
              isEmailVerified: data.isEmailVerified,
              paymentSessionId: data.paymentSessionId,
              bookingId: data.bookingId,
              paymentStatus: 'pending',
              isReturnFromStripe: false,
            },
            false,
            'booking/saveBeforeRedirect'
          )
        },

        setPaymentStatus: (status) => {
          set({ paymentStatus: status }, false, 'booking/setPaymentStatus')
        },

        setIsReturnFromStripe: (val) => {
          set({ isReturnFromStripe: val }, false, 'booking/setIsReturnFromStripe')
        },

        clearBookingStore: () => {
          set({ ...initialState }, false, 'booking/clear')
        },
      }),
      {
        name: 'booking-storage',
        storage: {
          getItem: (name) => {
            if (typeof window === 'undefined') return null
            const value = sessionStorage.getItem(name)
            return value ? JSON.parse(value) : null
          },
          setItem: (name, value) => {
            if (typeof window === 'undefined') return
            sessionStorage.setItem(name, JSON.stringify(value))
          },
          removeItem: (name) => {
            if (typeof window === 'undefined') return
            sessionStorage.removeItem(name)
          },
        },
      }
    ),
    { name: 'BookingStore' }
  )
)
