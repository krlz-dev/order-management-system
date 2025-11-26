import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search, 
  X, 
  Package,
  DollarSign,
  Trash2,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { CartView } from '@/components/CartView'
import { apiService } from '@/services/api'
import type { Product } from '@/types'

export const Route = createFileRoute('/products')({
  loader: ({ context }) => {
    return context.queryClient.fetchQuery({
      queryKey: ['products', { page: 0, size: 20, sortBy: 'name', sortDir: 'asc' }],
      queryFn: () => apiService.getProducts({ page: 0, size: 20, sortBy: 'name', sortDir: 'asc' }),
      staleTime: 0, // force refetch every navigation
    })
  },
  component: Products,
})

function Products() {
  const initialData = useLoaderData({ from: '/products' })
  const [searchQuery, setSearchQuery] = useState('')
  const [cartViewOpen, setCartViewOpen] = useState(false)

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    getItemQuantity,
    isCalculating
  } = useCart()

  const products = initialData?.data?.content || []

  // Filter products based on search
  const displayProducts = searchQuery 
    ? products.filter((product: any) => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem(product, quantity)
  }

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId)
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Products</h2>
            <p className="text-gray-600">Browse and add products to your cart.</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
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

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {displayProducts.map((product: any) => {
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
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {displayProducts.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search query.</p>
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
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
            <CardContent>
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Package className="w-8 h-8 mb-2" />
                  <p className="text-sm text-center">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
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

                  <div className="pt-3 border-t space-y-3">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {isCalculating ? 'calculating...' : getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={() => setCartViewOpen(true)}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Process Order
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <CartView 
        open={cartViewOpen}
        onClose={() => setCartViewOpen(false)}
        onOrderCreated={() => {
          window.location.reload()
        }}
      />
    </div>
  )
}