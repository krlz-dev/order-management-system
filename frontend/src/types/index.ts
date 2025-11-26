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
  product?: Product
  productId?: string
  productName?: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderItems: OrderItem[]
  totalPrice: number
  totalItems: number
  createdAt: string
  userId: string | null
  userEmail: string | null
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

export interface CartCalculationItem {
  productId: string
  quantity: number
}

export interface CartCalculationRequest {
  items: CartCalculationItem[]
}

export interface CartItemDetails {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  itemTotal: number
  available: boolean
  availableStock: number
}

export interface CartCalculationResponse {
  items: CartItemDetails[]
  totalPrice: number
  totalItems: number
}