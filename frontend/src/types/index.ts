export interface Product {
  id: string
  name: string
  price: number
  stock: number
}

export interface ProductCreateRequest {
  name: string
  price: number
  stock: number
}

export interface OrderItem {
  id: string
  product: Product
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderItems: OrderItem[]
  totalPrice: number
  createdAt: string
}

export interface OrderCreateRequest {
  items: {
    productId: string
    quantity: number
  }[]
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface ProductFilters {
  search?: string
  name?: string
  minPrice?: number
  maxPrice?: number
  minStock?: number
  maxStock?: number
}

export interface PaginationParams {
  page: number
  size: number
  sortBy: string
  sortDir: 'asc' | 'desc'
}