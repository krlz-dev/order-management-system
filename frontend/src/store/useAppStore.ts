import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AppState {
  // App-wide state
  isLoading: boolean
  error: string | null
  
  // Ping pong demo state
  pingResponse: string | null
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPingResponse: (response: string | null) => void
  clearError: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      isLoading: false,
      error: null,
      pingResponse: null,
      
      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setPingResponse: (response) => set({ pingResponse: response }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-store',
    }
  )
)