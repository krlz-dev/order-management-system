import { useMutation } from '@tanstack/react-query'
import { apiService } from '@/services/api'
import type { CartCalculationRequest, CartCalculationResponse } from '@/types'

export function useCartCalculation() {
  const {
    mutateAsync: calculateCart,
    data,
    isPending: isCalculating,
    error,
    reset
  } = useMutation({
    mutationFn: (request: CartCalculationRequest) => apiService.calculateCart(request),
    onError: (error) => {
      console.error('Cart calculation failed:', error)
    }
  })

  const calculateCartTotal = async (request: CartCalculationRequest): Promise<CartCalculationResponse | null> => {
    try {
      const response = await calculateCart(request)
      if (response.success && response.data) {
        return response.data
      } else {
        console.error('Cart calculation failed:', response.error)
        return null
      }
    } catch (error) {
      console.error('Cart calculation error:', error)
      return null
    }
  }

  return {
    calculateCartTotal,
    cartCalculation: data?.success ? data.data : null,
    isCalculating,
    error: error?.message || (data?.success === false ? data.error : null),
    reset
  }
}