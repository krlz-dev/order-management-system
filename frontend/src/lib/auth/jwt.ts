interface JWTPayload {
  email: string
  exp: number
  iat: number
  sub: string
}

export const jwtUtils = {
  /**
   * Decode JWT token without verification (client-side only)
   */
  decodeToken: (token: string): JWTPayload | null => {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null

      const payload = JSON.parse(atob(parts[1]))
      return payload as JWTPayload
    } catch (error) {
      console.error('Failed to decode JWT token:', error)
      return null
    }
  },

  /**
   * Check if token is expired (with 5-minute buffer)
   */
  isTokenExpired: (token: string, bufferMinutes: number = 5): boolean => {
    const payload = jwtUtils.decodeToken(token)
    if (!payload || !payload.exp) return true

    const now = Math.floor(Date.now() / 1000)
    const bufferSeconds = bufferMinutes * 60
    
    return payload.exp <= (now + bufferSeconds)
  },

  /**
   * Get expiration date from token
   */
  getTokenExpiration: (token: string): Date | null => {
    const payload = jwtUtils.decodeToken(token)
    if (!payload || !payload.exp) return null

    return new Date(payload.exp * 1000)
  },

  /**
   * Get time until token expires (in milliseconds)
   */
  getTimeUntilExpiration: (token: string): number => {
    const payload = jwtUtils.decodeToken(token)
    if (!payload || !payload.exp) return 0

    const now = Date.now()
    const expiration = payload.exp * 1000
    
    return Math.max(0, expiration - now)
  },

  /**
   * Check if token needs refresh (5 minutes before expiry)
   */
  needsRefresh: (token: string, refreshMinutes: number = 5): boolean => {
    return jwtUtils.isTokenExpired(token, refreshMinutes)
  }
}