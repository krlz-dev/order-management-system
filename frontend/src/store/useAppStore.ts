import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Product, Order, PageResponse } from '@/types'

export type PageType = 'dashboard' | 'orders' | 'products' | 'customers' | 'shipping' | 'payments' | 'analytics' | 'settings'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

interface OrdersState {
  orders: Order[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    size: number
    totalElements: number
    totalPages: number
  }
}

interface AppState {
  // Auth state
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  accessToken: string | null
  user: User | null
  currentPage: PageType
  pingResponse: string | null
  
  // Products state
  productsState: ProductsState
  
  // Orders state
  ordersState: OrdersState
  
  // Auth actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPingResponse: (response: string | null) => void
  setCurrentPage: (page: PageType) => void
  setAuth: (token: string, user: User) => void
  logout: () => void
  clearError: () => void
  
  // Products actions
  setProducts: (data: PageResponse<Product>) => void
  setProductsLoading: (loading: boolean) => void
  setProductsError: (error: string | null) => void
  clearProductsError: () => void
  
  // Orders actions
  setOrders: (data: PageResponse<Order>) => void
  setOrdersLoading: (loading: boolean) => void
  setOrdersError: (error: string | null) => void
  clearOrdersError: () => void
}

const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}

const getStoredUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('user')
    if (stored && stored !== 'undefined' && stored !== 'null') {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.warn('Failed to parse stored user data:', error)
        localStorage.removeItem('user')
        return null
      }
    }
  }
  return null
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Auth state
      isLoading: false,
      error: null,
      isAuthenticated: !!getStoredToken(),
      accessToken: getStoredToken(),
      user: getStoredUser(),
      currentPage: 'dashboard',
      pingResponse: null,
      
      // Products state
      productsState: {
        products: [],
        loading: false,
        error: null,
        pagination: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0
        }
      },
      
      // Orders state
      ordersState: {
        orders: [],
        loading: false,
        error: null,
        pagination: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0
        }
      },
      
      // Auth actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setPingResponse: (response) => set({ pingResponse: response }),
      setCurrentPage: (page) => set({ currentPage: page }),
      setAuth: (token, user) => {
        localStorage.setItem('accessToken', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ 
          isAuthenticated: true, 
          accessToken: token, 
          user,
          error: null 
        })
      },
      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        set({ 
          isAuthenticated: false, 
          accessToken: null, 
          user: null,
          currentPage: 'dashboard',
          // Reset other state on logout
          productsState: {
            products: [],
            loading: false,
            error: null,
            pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 }
          },
          ordersState: {
            orders: [],
            loading: false,
            error: null,
            pagination: { page: 0, size: 10, totalElements: 0, totalPages: 0 }
          }
        })
      },
      clearError: () => set({ error: null }),
      
      // Products actions
      setProducts: (data) => set((state) => ({
        productsState: {
          ...state.productsState,
          products: data.content,
          pagination: {
            page: data.page,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: data.totalPages
          },
          error: null
        }
      })),
      setProductsLoading: (loading) => set((state) => ({
        productsState: { ...state.productsState, loading }
      })),
      setProductsError: (error) => set((state) => ({
        productsState: { ...state.productsState, error, loading: false }
      })),
      clearProductsError: () => set((state) => ({
        productsState: { ...state.productsState, error: null }
      })),
      
      // Orders actions
      setOrders: (data) => set((state) => ({
        ordersState: {
          ...state.ordersState,
          orders: data.content,
          pagination: {
            page: data.page,
            size: data.size,
            totalElements: data.totalElements,
            totalPages: data.totalPages
          },
          error: null
        }
      })),
      setOrdersLoading: (loading) => set((state) => ({
        ordersState: { ...state.ordersState, loading }
      })),
      setOrdersError: (error) => set((state) => ({
        ordersState: { ...state.ordersState, error, loading: false }
      })),
      clearOrdersError: () => set((state) => ({
        ordersState: { ...state.ordersState, error: null }
      })),
    }),
    {
      name: 'app-store',
    }
  )
)