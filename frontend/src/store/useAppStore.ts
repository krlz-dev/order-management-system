import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type PageType = 'dashboard' | 'orders' | 'products' | 'customers' | 'shipping' | 'payments' | 'analytics' | 'settings'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AppState {
  // App-wide state
  isLoading: boolean
  error: string | null
  
  // Authentication state
  isAuthenticated: boolean
  accessToken: string | null
  user: User | null
  
  // Navigation state
  currentPage: PageType
  
  // Ping pong demo state
  pingResponse: string | null
  
  // Actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPingResponse: (response: string | null) => void
  setCurrentPage: (page: PageType) => void
  setAuth: (token: string, user: User) => void
  logout: () => void
  clearError: () => void
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
    return stored ? JSON.parse(stored) : null
  }
  return null
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      isLoading: false,
      error: null,
      isAuthenticated: !!getStoredToken(),
      accessToken: getStoredToken(),
      user: getStoredUser(),
      currentPage: 'dashboard',
      pingResponse: null,
      
      // Actions
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
          currentPage: 'dashboard'
        })
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: 'app-store',
    }
  )
)