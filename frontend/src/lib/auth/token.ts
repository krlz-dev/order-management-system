export interface DecodedToken {
  sub: string
  email: string
  name: string
  role: string
  exp: number
  iat: number
}

export const tokenStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('accessToken', token)
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  },

  isTokenValid: (token: string): boolean => {
    try {
      const decoded = decodeToken(token)
      const now = Date.now() / 1000
      return decoded.exp > now
    } catch {
      return false
    }
  },

  getTokenExpiry: (token: string): Date | null => {
    try {
      const decoded = decodeToken(token)
      return new Date(decoded.exp * 1000)
    } catch {
      return null
    }
  }
}

function decodeToken(token: string): DecodedToken {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  )
  return JSON.parse(jsonPayload)
}

export const authUtils = {
  isAuthenticated: (): boolean => {
    const token = tokenStorage.getToken()
    return token ? tokenStorage.isTokenValid(token) : false
  },

  shouldRefreshToken: (): boolean => {
    const token = tokenStorage.getToken()
    if (!token) return false
    
    const expiry = tokenStorage.getTokenExpiry(token)
    if (!expiry) return false
    
    // Refresh if token expires in the next 5 minutes
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000)
    return expiry.getTime() < fiveMinutesFromNow
  },

  clearAuth: (): void => {
    tokenStorage.removeToken()
  }
}