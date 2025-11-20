import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type PageType = 'dashboard' | 'orders' | 'products' | 'customers' | 'shipping' | 'payments' | 'analytics' | 'settings'

interface AppState {
  // App-wide state
  isLoading: boolean
  error: string | null
  
  // Navigation state
  currentPage: PageType
  
  // Ping pong demo state
  pingResponse: string | null
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPingResponse: (response: string | null) => void
  setCurrentPage: (page: PageType) => void
  clearError: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      isLoading: false,
      error: null,
      currentPage: 'dashboard',
      pingResponse: null,
      
      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setPingResponse: (response) => set({ pingResponse: response }),
      setCurrentPage: (page) => set({ currentPage: page }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-store',
    }
  )
)