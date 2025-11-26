import { createFileRoute, useLoaderData, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
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

interface ProductsSearch {
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  search?: string
}

export const Route = createFileRoute('/products')({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => {
    return {
      size: Number(search.size) || 20,
      sortBy: (search.sortBy as string) || 'name',
      sortDir: (search.sortDir as 'asc' | 'desc') || 'asc',
      search: search.search as string | undefined,
    }
  },
  loader: ({ context, search }) => {
    // Load initial page for infinite scroll
    const params = {
      page: 0, // Always start from page 0 for infinite scroll
      size: search?.size ?? 20,
      sortBy: search?.sortBy ?? 'name',
      sortDir: search?.sortDir ?? 'asc',
      search: search?.search
    }
    return context.queryClient.fetchQuery({
      queryKey: ['products-initial', params],
      queryFn: () => apiService.getProducts(params),
      staleTime: 0, // force refetch every navigation
    })
  },
  component: Products,
})

function Products() {
  const initialData = useLoaderData({ from: '/products' })
  const navigate = useNavigate({ from: '/products' })
  const search = useSearch({ from: '/products' })
  const [searchQuery, setSearchQuery] = useState(search?.search || '')
  const [cartViewOpen, setCartViewOpen] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)

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

  // Use infinite query for products
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['products-infinite', {
      size: search?.size ?? 20,
      sortBy: search?.sortBy ?? 'name', 
      sortDir: search?.sortDir ?? 'asc',
      search: search?.search
    }],
    queryFn: ({ pageParam = 0 }) => apiService.getProducts({
      page: pageParam,
      size: search?.size ?? 20,
      sortBy: search?.sortBy ?? 'name',
      sortDir: search?.sortDir ?? 'asc',
      search: search?.search
    }),
    getNextPageParam: (lastPage) => {
      if (lastPage.data && lastPage.data.page < lastPage.data.totalPages - 1) {
        return lastPage.data.page + 1
      }
      return undefined
    },
    initialData: initialData ? {
      pages: [initialData],
      pageParams: [0]
    } : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Flatten all products from all pages
  const allProducts = infiniteData?.pages?.flatMap(page => page?.data?.content || []) || []
  const firstPageData = infiniteData?.pages?.[0]?.data
  const totalElements = firstPageData?.totalElements || 0

  // Update local search state when URL search changes
  useEffect(() => {
    setSearchQuery(search?.search || '')
  }, [search?.search])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '200px' // Start loading before user reaches the bottom
      }
    )

    observer.observe(loadMoreRef.current)

    return () => {
      observer.disconnect()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Auto-scroll to top when search/sort changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [search?.search, search?.sortBy, search?.sortDir])

  // Products are already filtered by the backend based on search params
  const displayProducts = allProducts

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    navigate({
      search: (prev) => {
        const newSearch = {
          ...prev,
          search: query || undefined
        }
        // Remove page param since we're using infinite scroll
        delete newSearch.page
        return newSearch
      }
    })
  }, [navigate])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    navigate({
      search: (prev) => {
        const newSearch = { ...prev }
        delete newSearch.search
        delete newSearch.page
        return newSearch
      }
    })
  }, [navigate])

  const handleAddToCart = (product: Product, quantity = 1) => {
    addItem(product, quantity)
  }

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId)
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity)
  }

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleSortChange = (sortBy: string, sortDir: 'asc' | 'desc') => {
    navigate({
      search: (prev) => {
        const newSearch = {
          ...prev,
          sortBy,
          sortDir
        }
        // Remove page param since we're using infinite scroll
        delete newSearch.page
        return newSearch
      }
    })
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
            onClick={() => refetch()}
            variant="outline"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-3">
          {/* Search Bar and Sort Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={`${search?.sortBy || 'name'}-${search?.sortDir || 'asc'}`}
                onChange={(e) => {
                  const [sortBy, sortDir] = e.target.value.split('-')
                  handleSortChange(sortBy, sortDir as 'asc' | 'desc')
                }}
                className="px-3 py-1 border rounded-md text-sm bg-white"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="stock-asc">Stock (Low to High)</option>
                <option value="stock-desc">Stock (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Loading State for Initial Load */}
          {isLoading && displayProducts.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="h-fit">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse flex-1 mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-3 w-24"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              Error loading products: {error.message}
            </div>
          )}

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

          {/* Infinite Scroll Loading States */}
          {isFetchingNextPage && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={`loading-${index}`} className="h-fit">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse flex-1 mr-2"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-3 w-24"></div>
                    <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div 
            ref={loadMoreRef} 
            className="flex justify-center py-4"
          >
            {hasNextPage && !isFetchingNextPage && (
              <Button
                variant="ghost"
                onClick={handleLoadMore}
                className="px-8 text-gray-500 hover:text-gray-700"
              >
                Load More Products
              </Button>
            )}
          </div>

          {/* Products Count Info */}
          {displayProducts.length > 0 && (
            <div className="text-center text-sm text-gray-500 mb-6">
              <div className="inline-flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>
                  Showing {displayProducts.length} 
                  {totalElements > 0 && ` of ${totalElements}`} products
                </span>
              </div>
              {!hasNextPage && displayProducts.length > 0 && (
                <div className="mt-2 inline-flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs">All products loaded</span>
                </div>
              )}
            </div>
          )}

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
          // Refresh infinite query data
          refetch()
        }}
      />
    </div>
  )
}