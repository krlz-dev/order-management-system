import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Product, Order, PageResponse } from '@/types'
import { apiService } from '@/services/api'

export type PageType = 'dashboard' | 'orders' | 'products' | 'inventory'

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
  refreshToken: string | null
  tokenExpiration: number | null
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
  setAuth: (token: string, refreshToken: string, expiresIn: number, user: User) => void
  refreshAccessToken: () => Promise<boolean>
  logout: () => void
  clearError: () => void
  validateToken: () => Promise<boolean>
  
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

const getStoredRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken')
  }
  return null
}

const getStoredTokenExpiration = (): number | null => {
  if (typeof window !== 'undefined') {
    const exp = localStorage.getItem('tokenExpiration')
    return exp ? parseInt(exp, 10) : null
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
    (set, get) => ({
      // Auth state
      isLoading: false,
      error: null,
      isAuthenticated: !!getStoredToken(),
      accessToken: getStoredToken(),
      refreshToken: getStoredRefreshToken(),
      tokenExpiration: getStoredTokenExpiration(),
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
      setAuth: (token, refreshToken, expiresIn, user) => {
        const expiration = Date.now() + (expiresIn * 1000)
        localStorage.setItem('accessToken', token)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('tokenExpiration', expiration.toString())
        localStorage.setItem('user', JSON.stringify(user))
        set({ 
          isAuthenticated: true, 
          accessToken: token,
          refreshToken, 
          tokenExpiration: expiration,
          user,
          error: null 
        })
      },
      refreshAccessToken: async () => {
        const currentRefreshToken = get().refreshToken
        if (!currentRefreshToken) return false

        try {
          const response = await apiService.refreshToken(currentRefreshToken)
          if (response.success && response.data) {
            const { accessToken, refreshToken, expiresIn } = response.data
            const expiration = Date.now() + (expiresIn * 1000)
            
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('tokenExpiration', expiration.toString())
            
            set({ 
              accessToken,
              refreshToken,
              tokenExpiration: expiration
            })
            return true
          }
        } catch (error) {
          console.error('Token refresh failed:', error)
        }
        return false
      },
      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('tokenExpiration')
        localStorage.removeItem('user')
        set({ 
          isAuthenticated: false, 
          accessToken: null,
          refreshToken: null,
          tokenExpiration: null,
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
      validateToken: async () => {
        const token = getStoredToken()
        if (!token) {
          set({ isAuthenticated: false, accessToken: null, user: null })
          return false
        }

        try {
          const response = await apiService.validateToken()
          if (response.success && response.data?.valid === true) {
            // Token is valid, ensure user data is consistent
            const currentUser = getStoredUser()
            if (currentUser && response.data.email && currentUser.email !== response.data.email) {
              // Email mismatch, clear auth state
              localStorage.removeItem('accessToken')
              localStorage.removeItem('user')
              set({ isAuthenticated: false, accessToken: null, user: null })
              return false
            }
            return true
          } else {
            // Token is invalid, clear auth state
            localStorage.removeItem('accessToken')
            localStorage.removeItem('user')
            set({ isAuthenticated: false, accessToken: null, user: null })
            return false
          }
        } catch (error) {
          // Network error or other issue, clear auth state to be safe
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          set({ isAuthenticated: false, accessToken: null, user: null })
          return false
        }
      },
      
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