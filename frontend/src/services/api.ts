const API_BASE_URL = 'http://localhost:8080/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
  success: boolean
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
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

  async ping(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/ping')
  }
}

export const apiService = new ApiService()