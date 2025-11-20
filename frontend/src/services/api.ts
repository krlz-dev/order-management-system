const API_BASE_URL = 'http://localhost:8080/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth = false
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      // Add auth headers if required or if token is available
      if (requireAuth || localStorage.getItem('accessToken')) {
        Object.assign(headers, this.getAuthHeaders())
      }

      const response = await fetch(url, {
        headers,
        ...options,
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, clear auth state
          localStorage.removeItem('accessToken')
          localStorage.removeItem('user')
          throw new Error('Authentication required')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data, success: true }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    }, true)
  }

  // Protected endpoints
  async ping(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/ping', {}, true)
  }

  // Add more API methods here as needed
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/auth/profile', {}, true)
  }

  async getOrders(): Promise<ApiResponse<any[]>> {
    return this.request('/orders', {}, true)
  }

  async getProducts(): Promise<ApiResponse<any[]>> {
    return this.request('/products', {}, true)
  }

  async getCustomers(): Promise<ApiResponse<any[]>> {
    return this.request('/customers', {}, true)
  }
}

export const apiService = new ApiService()