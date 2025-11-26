import { useState, useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  RefreshCw,
  Filter,
  ChevronDown
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useProducts } from '@/hooks/useProducts'
import { CartView } from '@/components/CartView'
import type { Product, ProductFilters } from '@/types'

interface ProductsSearch extends ProductFilters {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export function Products() {
  const navigate = useNavigate()
  const searchParams = useSearch({ strict: false }) as ProductsSearch
  
  const [searchQuery, setSearchQuery] = useState(searchParams?.search || '')
  const [cartViewOpen, setCartViewOpen] = useState(false)

  const queryParams = {
    page: searchParams?.page || 0,
    size: searchParams?.size || 20,
    sortBy: searchParams?.sortBy || 'name',
    sortDir: searchParams?.sortDir || 'asc',
    search: searchParams?.search,
    name: searchParams?.name,
    minPrice: searchParams?.minPrice,
    maxPrice: searchParams?.maxPrice,
    minStock: searchParams?.minStock,
    maxStock: searchParams?.maxStock,
  }

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

  const {
    products,
    pagination,
    isLoading,
    error,
    refetch
  } = useProducts(queryParams)
  

  const updateUrlParams = useCallback((updates: Partial<ProductsSearch>) => {
    (navigate as any)({
      search: (prev: any) => ({
        ...prev,
        ...updates,
        page: 0, // Reset to first page when filters change
      })
    })
  }, [navigate])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    updateUrlParams({ search: query || undefined })
  }, [updateUrlParams])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    updateUrlParams({ search: undefined })
  }, [updateUrlParams])

  const handleFilterChange = useCallback((filterKey: keyof ProductFilters, value: string | number | undefined) => {
    updateUrlParams({ [filterKey]: value })
  }, [updateUrlParams])

  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('')
    updateUrlParams({
      search: undefined,
      name: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      minStock: undefined,
      maxStock: undefined,
    })
  }, [updateUrlParams])

  const handleSortChange = useCallback((sortBy: string, sortDir: 'asc' | 'desc') => {
    updateUrlParams({ sortBy, sortDir })
  }, [updateUrlParams])

  const getActiveFiltersCount = () => {
    const { page, size, sortBy, sortDir, ...filters } = searchParams || {}
    return Object.values(filters).filter(value => value !== undefined && value !== '').length
  }

  const getActiveFilters = () => {
    const { page, size, sortBy, sortDir, ...filters } = searchParams || {}
    return Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')
    )
  }

  const loadMoreProducts = () => {
    if (pagination && pagination.page < pagination.totalPages - 1) {
      (navigate as any)({
        search: (prev: any) => ({
          ...prev,
          page: (searchParams?.page || 0) + 1
        })
      })
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

  const handleRefresh = () => {
    refetch()
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
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
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
              
              {/* Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {getActiveFiltersCount() > 0 && (
                      <span className="bg-teal-600 text-white text-xs rounded-full px-2 py-1 ml-1">
                        {getActiveFiltersCount()}
                      </span>
                    )}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 p-4">
                  <DropdownMenuLabel>Filter Products</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Price Range */}
                  <div className="space-y-3 py-2">
                    <Label className="text-sm font-medium">Price Range</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="minPrice" className="text-xs text-gray-600">Min Price</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          placeholder="0.00"
                          value={searchParams?.minPrice || ''}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="mt-1"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="maxPrice" className="text-xs text-gray-600">Max Price</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          placeholder="999.99"
                          value={searchParams?.maxPrice || ''}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="mt-1"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Stock Range */}
                  <div className="space-y-3 py-2">
                    <Label className="text-sm font-medium">Stock Range</Label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="minStock" className="text-xs text-gray-600">Min Stock</Label>
                        <Input
                          id="minStock"
                          type="number"
                          placeholder="0"
                          value={searchParams?.minStock || ''}
                          onChange={(e) => handleFilterChange('minStock', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="mt-1"
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <Label htmlFor="maxStock" className="text-xs text-gray-600">Max Stock</Label>
                        <Input
                          id="maxStock"
                          type="number"
                          placeholder="1000"
                          value={searchParams?.maxStock || ''}
                          onChange={(e) => handleFilterChange('maxStock', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="mt-1"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Product Name Filter */}
                  <div className="space-y-2 py-2">
                    <Label htmlFor="nameFilter" className="text-sm font-medium">Product Name</Label>
                    <Input
                      id="nameFilter"
                      type="text"
                      placeholder="Filter by name..."
                      value={searchParams?.name || ''}
                      onChange={(e) => handleFilterChange('name', e.target.value || undefined)}
                      className="mt-1"
                    />
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Sort Options */}
                  <div className="space-y-3 py-2">
                    <Label className="text-sm font-medium">Sort By</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button
                          variant={queryParams.sortBy === 'name' && queryParams.sortDir === 'asc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSortChange('name', 'asc')}
                          className="flex-1 text-xs"
                        >
                          Name A-Z
                        </Button>
                        <Button
                          variant={queryParams.sortBy === 'name' && queryParams.sortDir === 'desc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSortChange('name', 'desc')}
                          className="flex-1 text-xs"
                        >
                          Name Z-A
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={queryParams.sortBy === 'price' && queryParams.sortDir === 'asc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSortChange('price', 'asc')}
                          className="flex-1 text-xs"
                        >
                          Price Low-High
                        </Button>
                        <Button
                          variant={queryParams.sortBy === 'price' && queryParams.sortDir === 'desc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSortChange('price', 'desc')}
                          className="flex-1 text-xs"
                        >
                          Price High-Low
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={queryParams.sortBy === 'stock' && queryParams.sortDir === 'desc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSortChange('stock', 'desc')}
                          className="flex-1 text-xs"
                        >
                          Stock High-Low
                        </Button>
                        <Button
                          variant={queryParams.sortBy === 'stock' && queryParams.sortDir === 'asc' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleSortChange('stock', 'asc')}
                          className="flex-1 text-xs"
                        >
                          Stock Low-High
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear Filters Button */}
                  {getActiveFiltersCount() > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllFilters}
                        className="w-full mt-2"
                      >
                        Clear All Filters
                      </Button>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {Object.entries(getActiveFilters()).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-xs"
                  >
                    {key === 'search' ? `Search: "${value}"` :
                     key === 'name' ? `Name: "${value}"` :
                     key === 'minPrice' ? `Min Price: $${value}` :
                     key === 'maxPrice' ? `Max Price: $${value}` :
                     key === 'minStock' ? `Min Stock: ${value}` :
                     key === 'maxStock' ? `Max Stock: ${value}` : `${key}: ${value}`}
                    <button
                      onClick={() => handleFilterChange(key as keyof ProductFilters, undefined)}
                      className="ml-1 hover:bg-teal-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Results Summary */}
          {pagination && (
            <div className="text-sm text-gray-600 mb-4">
              Showing {products?.length || 0} of {pagination.totalElements} products
              {getActiveFiltersCount() > 0 && ' (filtered)'}
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {isLoading && (!products || products.length === 0) ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, index) => (
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
              ))
            ) : (
              (products || []).map((product, index) => {
                const cartQuantity = getItemQuantity(product.id)
                return (
                  <Card key={`${product.id}-${index}`} className="h-fit">
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
              })
            )}
          </div>

          {/* Load More Button */}
          {pagination && pagination.page < pagination.totalPages - 1 && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={loadMoreProducts}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Products'}
              </Button>
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
          // Optionally refresh products or show success message
          void refetch()
        }}
      />
    </div>
  )
}