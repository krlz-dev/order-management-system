import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  X, 
  Package,
  DollarSign,
  Trash2
} from 'lucide-react'
import { apiService } from '@/services/api'
import { useCartStore } from '@/store/useCartStore'
import type { Product, PageResponse, ProductFilters } from '@/types'

interface OrderCreationDialogProps {
  open: boolean
  onClose: () => void
  onOrderCreated: () => void
}

export function OrderCreationDialog({ open, onClose, onOrderCreated }: OrderCreationDialogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ProductFilters>({})
  const [pagination, setPagination] = useState({
    page: 0,
    size: 8,
    totalElements: 0,
    totalPages: 0
  })

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getItemQuantity
  } = useCartStore()

  const loadProducts = useCallback(async (page = 0, resetProducts = false) => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiService.getProducts({
        page,
        size: pagination.size,
        sortBy: 'name',
        sortDir: 'asc',
        ...filters
      })

      if (response.success && response.data) {
        if (resetProducts || page === 0) {
          setProducts(response.data.content)
        } else {
          setProducts(prev => [...prev, ...response.data.content])
        }
        
        setPagination({
          page: response.data.page,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages
        })
      } else {
        setError(response.error || 'Failed to load products')
      }
    } catch (err) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [pagination.size, filters])

  useEffect(() => {
    if (open) {
      loadProducts(0, true)
    }
  }, [open, loadProducts])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, search: query || undefined }
    setFilters(newFilters)
    // Reset products and load from first page
    loadProducts(0, true)
  }, [filters, loadProducts])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    const newFilters = { ...filters }
    delete newFilters.search
    setFilters(newFilters)
    loadProducts(0, true)
  }, [filters, loadProducts])

  const loadMoreProducts = () => {
    if (pagination.page < pagination.totalPages - 1) {
      loadProducts(pagination.page + 1, false)
    }
  }

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem(product, quantity)
  }

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId)
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity)
  }

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      setError('Please add at least one item to the cart')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const orderData = {
        orderItems: items.map(item => ({
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            stock: item.product.stock
          },
          quantity: item.quantity,
          unitPrice: item.product.price
        }))
      }

      const response = await apiService.createOrder(orderData)
      
      if (response.success) {
        clearCart()
        onOrderCreated()
        onClose()
      } else {
        setError(response.error || 'Failed to create order')
      }
    } catch (err) {
      setError('Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    clearCart()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Create New Order
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Product Selection */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Available Products</h3>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0" style={{ maxHeight: '400px' }}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                {products.map((product) => {
                  const cartQuantity = getItemQuantity(product.id)
                  return (
                    <Card key={product.id} className="h-fit">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-sm">{product.name}</h4>
                          <span className="text-sm font-bold text-green-600">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">
                          Stock: {product.stock} available
                        </p>
                        
                        <div className="flex items-center justify-between">
                          {cartQuantity > 0 ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(product.id, cartQuantity - 1)}
                                className="h-8 w-8 p-0"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-sm font-medium w-8 text-center">
                                {cartQuantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(product.id, cartQuantity + 1)}
                                disabled={cartQuantity >= product.stock}
                                className="h-8 w-8 p-0"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock === 0}
                              className="flex-1"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {pagination.page < pagination.totalPages - 1 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={loadMoreProducts}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="flex flex-col min-h-0">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart
                  </div>
                  <span className="text-sm font-normal">
                    {getTotalItems()} items
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto min-h-0 flex flex-col">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <Package className="w-8 h-8 mb-2" />
                    <p className="text-sm">Your cart is empty</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3 pb-4">
                      {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center p-3 border rounded">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm truncate">{item.product.name}</h5>
                          <p className="text-xs text-gray-600">
                            ${item.product.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromCart(item.product.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      ))}
                    </div>
                  </div>
                )}

                {items.length > 0 && (
                  <div className="flex-shrink-0 mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitOrder}
            disabled={items.length === 0 || submitting}
          >
            {submitting ? 'Creating Order...' : `Create Order (${getTotalItems()} items)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}