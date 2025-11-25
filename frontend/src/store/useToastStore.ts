import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  description?: string
  duration?: number
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastState>()(
  devtools(
    (set) => ({
      toasts: [],
      
      addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 15)
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }]
        }))
      },
      
      removeToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        }))
      },
      
      clearToasts: () => {
        set({ toasts: [] })
      }
    }),
    {
      name: 'toast-store',
    }
  )
)