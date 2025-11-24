import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Product } from '@/types'

export interface CartItem {
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  
  // Actions
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  getItemQuantity: (productId: string) => number
  
  // Dialog actions
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartState>()(
  devtools(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (product, quantity = 1) => {
        const items = get().items
        const existingItemIndex = items.findIndex(item => item.product.id === product.id)
        
        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...items]
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          }
          set({ items: updatedItems })
        } else {
          // Add new item
          set({ items: [...items, { product, quantity }] })
        }
      },
      
      removeItem: (productId) => {
        set(state => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set(state => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },
      
      clearCart: () => {
        set({ items: [] })
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => 
          total + (item.product.price * item.quantity), 0
        )
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getItemQuantity: (productId) => {
        const item = get().items.find(item => item.product.id === productId)
        return item ? item.quantity : 0
      },
      
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
    }),
    {
      name: 'cart-store',
    }
  )
)