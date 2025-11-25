import { useRef, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { jwtUtils } from '@/lib/auth/jwt'

export function useTokenValidation() {
  const { 
    accessToken, 
    refreshAccessToken, 
    validateToken, 
    logout 
  } = useAppStore()
  const isValidatingRef = useRef(false)
  const lastValidationRef = useRef<number>(0)

  const validateTokenOnce = useCallback(async (): Promise<boolean> => {
    // If already validating, return a promise that resolves when current validation is done
    if (isValidatingRef.current) {
      return new Promise((resolve) => {
        const checkValidation = () => {
          if (!isValidatingRef.current) {
            resolve(useAppStore.getState().isAuthenticated)
          } else {
            setTimeout(checkValidation, 100)
          }
        }
        checkValidation()
      })
    }

    if (!accessToken) {
      return false
    }

    // Check if token needs refresh (5 minutes before expiry)
    if (jwtUtils.needsRefresh(accessToken, 5)) {
      console.log('Token needs refresh, attempting to refresh...')
      
      isValidatingRef.current = true
      try {
        const refreshSuccess = await refreshAccessToken()
        if (refreshSuccess) {
          console.log('Token refreshed successfully')
          return true
        } else {
          console.log('Token refresh failed, logging out')
          logout()
          return false
        }
      } catch (error) {
        console.error('Token refresh error:', error)
        logout()
        return false
      } finally {
        isValidatingRef.current = false
      }
    }

    // Token is still valid, no need to validate with server frequently
    const now = Date.now()
    const timeSinceLastValidation = now - lastValidationRef.current
    const VALIDATION_INTERVAL = 5 * 60 * 1000 // 5 minutes

    if (timeSinceLastValidation < VALIDATION_INTERVAL) {
      return true // Assume valid if checked recently and not expired
    }

    // Perform server validation
    isValidatingRef.current = true
    lastValidationRef.current = now

    try {
      const result = await validateToken()
      return result
    } catch (error) {
      console.error('Token validation failed:', error)
      logout()
      return false
    } finally {
      isValidatingRef.current = false
    }
  }, [accessToken, refreshAccessToken, validateToken, logout])

  return {
    validateTokenOnce,
    isValidating: isValidatingRef.current,
    needsRefresh: accessToken ? jwtUtils.needsRefresh(accessToken, 5) : false,
    timeUntilExpiry: accessToken ? jwtUtils.getTimeUntilExpiration(accessToken) : 0
  }
}