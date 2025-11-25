import { useEffect } from 'react'
import { useCartStore } from '@/store/useCartStore'
import { useCartCalculation } from './useCartCalculation'
import type { Product } from '@/types'

export function useCart() {
  const {
    items,
    isOpen,
    calculation,
    isCalculating: storeIsCalculating,
    addItem: storeAddItem,
    removeItem: storeRemoveItem,
    updateQuantity: storeUpdateQuantity,
    clearCart: storeClearCart,
    getTotalPrice,
    getTotalItems,
    getItemQuantity,
    setCalculation,
    setCalculating,
    openCart,
    closeCart
  } = useCartStore()

  const { calculateCartTotal, isCalculating: hookIsCalculating } = useCartCalculation()

  // Function to recalculate prices from backend
  const recalculateCart = async () => {
    if (items.length === 0) {
      setCalculation(null)
      return
    }

    setCalculating(true)
    
    try {
      const cartRequest = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      }

      const result = await calculateCartTotal(cartRequest)
      setCalculation(result)
    } catch (error) {
      console.error('Failed to calculate cart total:', error)
      setCalculation(null)
    } finally {
      setCalculating(false)
    }
  }

  // Recalculate whenever items change
  useEffect(() => {
    recalculateCart()
  }, [items])

  const addItem = async (product: Product, quantity: number = 1) => {
    storeAddItem(product, quantity)
    // Recalculation will be triggered by the useEffect
  }

  const removeItem = async (productId: string) => {
    storeRemoveItem(productId)
    // Recalculation will be triggered by the useEffect
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    storeUpdateQuantity(productId, quantity)
    // Recalculation will be triggered by the useEffect
  }

  const clearCart = () => {
    storeClearCart()
    // This will trigger useEffect and clear calculation
  }

  return {
    // State
    items,
    isOpen,
    calculation,
    isCalculating: storeIsCalculating || hookIsCalculating,
    
    // Calculated values (from backend)
    getTotalPrice,
    getTotalItems,
    getItemQuantity,
    
    // Actions
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    recalculateCart,
    
    // Dialog actions
    openCart,
    closeCart
  }
}