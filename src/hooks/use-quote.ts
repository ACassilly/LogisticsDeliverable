/**
 * Custom React Hook for Quote/Rate Operations
 * Uses React Query mutation for requesting freight rate quotes
 */

'use client'

import { useMutation } from '@tanstack/react-query'
import { getQuoteRate, getAllCarrierRates } from '@/services/quote.service'
import type { QuoteRateRequestPayload, QuoteRateApiResponse, AllCarrierRateApiResponse } from '@/types'
import { useToast } from '@/hooks/use-toast'

/**
 * Hook for requesting a freight rate quote.
 * 
 * Uses a mutation (not a query) because rate requests are:
 * - Triggered by user action (form submission)
 * - Not cacheable (rates change frequently — quoteIds are one-time-use)
 * - POST requests with a request body
 * 
 * @returns Mutation object with mutate/mutateAsync, data, isPending, isError, error, reset
 * 
 * @example
 * ```tsx
 * const { mutate, data, isPending, isError } = useQuoteRate()
 * 
 * const handleSubmit = (formData) => {
 *   mutate(formData, {
 *     onSuccess: (result) => {
 *       console.log('Rate:', result.data.lowestCost?.rate)
 *     },
 *   })
 * }
 * ```
 */
export function useQuoteRate() {
  const { toast } = useToast()

  return useMutation<QuoteRateApiResponse, Error, QuoteRateRequestPayload>({
    mutationFn: getQuoteRate,
    onError: (error) => {
      // Extract a user-friendly error message
      let message = 'Failed to get a rate quote. Please try again.'

      if (error instanceof Error) {
        // Axios wraps error responses — try to extract the API error message
        const axiosError = error as Error & {
          response?: { data?: { error?: string; message?: string } }
        }

        if (axiosError.response?.data?.error) {
          message = axiosError.response.data.error
        } else if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message
        } else if (error.message) {
          message = error.message
        }
      }

      toast({
        title: 'Quote Error',
        description: message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook for requesting all carrier rates via the V2 API.
 * Used by the booking form to display carrier rate cards.
 */
export function useAllCarrierRates() {
  const { toast } = useToast()

  return useMutation<AllCarrierRateApiResponse, Error, QuoteRateRequestPayload>({
    mutationFn: getAllCarrierRates,
    onError: (error) => {
      let message = 'Failed to get carrier rates. Please try again.'

      if (error instanceof Error) {
        const axiosError = error as Error & {
          response?: { data?: { error?: string; message?: string } }
        }
        if (axiosError.response?.data?.error) {
          message = axiosError.response.data.error
        } else if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message
        } else if (error.message) {
          message = error.message
        }
      }

      toast({
        title: 'Rate Error',
        description: message,
        variant: 'destructive',
      })
    },
  })
}
