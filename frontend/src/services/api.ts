import type { Product, ProductCreateRequest, Order, PageResponse, ProductFilters, PaginationParams, CartCalculationRequest, CartCalculationResponse } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

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
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: {
    id: string
    email: string
    name: string
    roles: string[]
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
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
        ...(options.headers as Record<string, string> || {}),
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

  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.request<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  }

  async validateToken(): Promise<ApiResponse<{ valid: boolean; email?: string }>> {
    return this.request<{ valid: boolean; email?: string }>('/auth/validate', {}, true)
  }

  // Protected endpoints
  async ping(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/ping', {}, true)
  }

  // Products API
  async getProducts(params: Partial<PaginationParams & ProductFilters> = {}): Promise<ApiResponse<PageResponse<Product>>> {
    console.log('🚀 API call:', { sortBy: params.sortBy, sortDir: params.sortDir, page: params.page })
    
    const searchParams = new URLSearchParams()
    
    // Pagination params
    if (params.page !== undefined) searchParams.append('page', params.page.toString())
    if (params.size !== undefined) searchParams.append('size', params.size.toString())
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortDir) searchParams.append('sortDir', params.sortDir)
    
    // Filter params
    if (params.search) searchParams.append('search', params.search)
    if (params.name) searchParams.append('name', params.name)
    if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString())
    if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString())
    if (params.minStock !== undefined) searchParams.append('minStock', params.minStock.toString())
    if (params.maxStock !== undefined) searchParams.append('maxStock', params.maxStock.toString())
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/products?${queryString}` : '/products'
    
    return this.request<PageResponse<Product>>(endpoint, {}, true)
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`, {}, true)
  }

  async createProduct(product: ProductCreateRequest): Promise<ApiResponse<Product>> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }, true)
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }, true)
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    }, true)
  }

  // Orders API
  async getOrders(params: Partial<PaginationParams & { search?: string }> = {}): Promise<ApiResponse<PageResponse<Order>>> {
    const searchParams = new URLSearchParams()
    
    if (params.page !== undefined) searchParams.append('page', params.page.toString())
    if (params.size !== undefined) searchParams.append('size', params.size.toString())
    if (params.sortBy) searchParams.append('sortBy', params.sortBy)
    if (params.sortDir) searchParams.append('sortDir', params.sortDir)
    if (params.search) searchParams.append('search', params.search)
    
    const queryString = searchParams.toString()
    const endpoint = queryString ? `/orders?${queryString}` : '/orders'
    
    return this.request<PageResponse<Order>>(endpoint, {}, true)
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}`, {}, true)
  }

  async createOrder(cartRequest: CartCalculationRequest): Promise<ApiResponse<Order>> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(cartRequest),
    }, true)
  }

  async calculateCart(cartRequest: CartCalculationRequest): Promise<ApiResponse<CartCalculationResponse>> {
    return this.request<CartCalculationResponse>('/orders/calculate', {
      method: 'POST',
      body: JSON.stringify(cartRequest),
    }, true)
  }

  // Profile API
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/auth/profile', {}, true)
  }

  async getCustomers(): Promise<ApiResponse<any[]>> {
    return this.request('/customers', {}, true)
  }
}

export const apiService = new ApiService()