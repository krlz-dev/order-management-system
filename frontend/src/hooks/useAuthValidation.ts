import { useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { authUtils } from '@/lib/auth/token'
import { useTokenValidation } from './useTokenValidation'

export function useAuthValidation() {
  const { isAuthenticated, logout } = useAppStore()
  const { validateTokenOnce } = useTokenValidation()

  const performTokenValidation = useCallback(async () => {
    // Only validate if user appears to be authenticated
    if (!isAuthenticated) return

    try {
      // First check client-side token validity
      const isClientValid = authUtils.isAuthenticated()
      if (!isClientValid) {
        logout()
        return
      }

      // Then validate with server (prevents duplicate calls)
      const isServerValid = await validateTokenOnce()
      if (!isServerValid) {
        logout()
      }
    } catch (error) {
      console.error('Token validation error:', error)
      logout()
    }
  }, [isAuthenticated, validateTokenOnce, logout])

  // Validate token on mount and periodically
  useEffect(() => {
    performTokenValidation()
    
    // Set up periodic validation (every 5 minutes)
    const interval = setInterval(performTokenValidation, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [performTokenValidation])

  return {
    performTokenValidation
  }
}