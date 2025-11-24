import { useState, useEffect, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import type { ColDef, GridReadyEvent, PaginationChangedEvent, SortChangedEvent, GridApi } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule])
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Package, Plus, Edit, Trash2, MoreVertical, Eye, Search, X } from 'lucide-react'
import { apiService } from '@/services/api'
import type { Product, PageResponse, PaginationParams, ProductFilters, ProductCreateRequest } from '@/types'
import { ProductModal } from '@/components/ProductModal'

interface ProductRowData extends Product {
  actions?: string
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<ProductRowData[]>([]) // For AG Grid pagination
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ProductFilters>({})
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })
  const [sortModel, setSortModel] = useState({
    sortBy: 'name',
    sortDir: 'asc' as 'asc' | 'desc'
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [isEdit, setIsEdit] = useState(false)

  const columnDefs = useMemo<ColDef<ProductRowData>[]>(() => [
    {
      headerName: 'Name',
      field: 'name',
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 200,
      cellRenderer: (params: any) => {
        if (params.data.id?.startsWith('placeholder-') || !params.data.name) {
          return ''
        }
        return params.value
      }
    },
    {
      headerName: 'Price',
      field: 'price',
      sortable: true,
      filter: 'agNumberColumnFilter',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => {
        if (params.data.id?.startsWith('placeholder-') || !params.data.name) {
          return ''
        }
        return `$${params.value?.toFixed(2) || '0.00'}`
      }
    },
    {
      headerName: 'Stock',
      field: 'stock',
      sortable: true,
      filter: 'agNumberColumnFilter',
      flex: 1,
      minWidth: 100,
      cellRenderer: (params: any) => {
        if (params.data.id?.startsWith('placeholder-') || !params.data.name) {
          return ''
        }
        return params.value
      },
      cellStyle: (params) => {
        if (params.data.id?.startsWith('placeholder-') || !params.data.name) {
          return null
        }
        if (params.value <= 10) {
          return { color: 'red', fontWeight: 'bold' }
        }
        return null
      }
    },
    {
      headerName: 'Actions',
      field: 'actions',
      sortable: false,
      filter: false,
      flex: 1,
      minWidth: 80,
      cellRenderer: (params: any) => {
        // Don't show actions for placeholder rows
        if (params.data.id?.startsWith('placeholder-') || !params.data.name) {
          return ''
        }
        
        return (
          <div className="flex items-center justify-center h-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => handleView(params.data)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(params.data)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(params.data.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ], [])

  const loadProducts = useCallback(async (page?: number, size?: number, sortBy?: string, sortDir?: 'asc' | 'desc', searchFilters?: ProductFilters) => {
    setLoading(true)
    setError(null)
    
    const currentPage = page !== undefined ? page : pagination.page
    const currentSize = size !== undefined ? size : pagination.size
    const currentSortBy = sortBy || sortModel.sortBy
    const currentSortDir = sortDir || sortModel.sortDir
    const currentFilters = searchFilters || filters
    
    try {
      const response = await apiService.getProducts({
        page: currentPage,
        size: currentSize,
        sortBy: currentSortBy,
        sortDir: currentSortDir,
        ...currentFilters
      })
      
      if (response.success && response.data) {
        setProducts(response.data.content)
        setPagination({
          page: response.data.page,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages
        })
        if (sortBy && sortDir) {
          setSortModel({ sortBy: currentSortBy, sortDir: currentSortDir })
        }
        
        // Create a full array with placeholders for proper pagination display
        const fullArray: ProductRowData[] = []
        const totalElements = response.data.totalElements
        const pageSize = response.data.size
        const currentPageData = response.data.content
        
        // Fill the array with actual data and placeholders
        for (let i = 0; i < totalElements; i++) {
          const pageIndex = Math.floor(i / pageSize)
          const indexInPage = i % pageSize
          
          if (pageIndex === currentPage && indexInPage < currentPageData.length) {
            // Current page data
            fullArray[i] = currentPageData[indexInPage]
          } else {
            // Placeholder for other pages
            fullArray[i] = {
              id: `placeholder-${i}`,
              name: '',
              price: 0,
              stock: 0
            }
          }
        }
        
        setAllProducts(fullArray)
        
        // Sync AG Grid pagination with server response
        if (gridApi) {
          gridApi.paginationGoToPage(response.data.page)
        }
      } else {
        setError(response.error || 'Failed to load products')
      }
    } catch (err) {
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, sortModel.sortBy, sortModel.sortDir, filters])

  useEffect(() => {
    loadProducts()
  }, [])

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
  }, [])

  const onPaginationChanged = useCallback((event: PaginationChangedEvent) => {
    const currentPage = event.api.paginationGetCurrentPage()
    const pageSize = event.api.paginationGetPageSize()
    
    console.log('Pagination changed:', { currentPage, pageSize, statePage: pagination.page, stateSize: pagination.size })
    
    // Handle page size changes
    if (pageSize !== pagination.size) {
      console.log('Page size changed, loading with new size:', pageSize)
      loadProducts(0, pageSize) // Reset to first page when page size changes
      return
    }
    
    // Handle page navigation - only load if we don't have data for that page
    if (currentPage !== pagination.page) {
      const startIndex = currentPage * pageSize
      const hasDataForPage = allProducts.slice(startIndex, startIndex + pageSize).some(item => item.name && !item.id?.startsWith('placeholder-'))
      
      if (!hasDataForPage) {
        console.log('Page navigation, loading page:', currentPage)
        loadProducts(currentPage)
      }
    }
  }, [loadProducts, pagination.page, pagination.size, allProducts])

  const onSortChanged = useCallback((event: SortChangedEvent) => {
    const sortModel = event.api.getColumnState().find(col => col.sort)
    if (sortModel) {
      const newSortBy = sortModel.colId
      const newSortDir = sortModel.sort === 'desc' ? 'desc' : 'asc'
      loadProducts(0, undefined, newSortBy, newSortDir) // Reset to first page when sorting
    }
  }, [loadProducts])

  const handleCreate = () => {
    setEditingProduct(undefined)
    setIsEdit(false)
    setModalOpen(true)
  }

  const handleView = (product: Product) => {
    // TODO: Implement product details modal
    console.log('View product details', product)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsEdit(true)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await apiService.deleteProduct(id)
      if (response.success) {
        loadProducts()
      } else {
        setError(response.error || 'Failed to delete product')
      }
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    const newFilters = { ...filters, search: query || undefined }
    setFilters(newFilters)
    loadProducts(0, undefined, undefined, undefined, newFilters) // Reset to first page when searching
  }, [filters, loadProducts])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    const newFilters = { ...filters }
    delete newFilters.search
    setFilters(newFilters)
    loadProducts(0, undefined, undefined, undefined, newFilters)
  }, [filters, loadProducts])

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingProduct(undefined)
    setIsEdit(false)
  }

  const handleModalSubmit = async (data: ProductCreateRequest) => {
    try {
      if (isEdit && editingProduct) {
        const response = await apiService.updateProduct(editingProduct.id, data)
        if (response.success) {
          loadProducts()
          setError(null)
        } else {
          setError(response.error || 'Failed to update product')
        }
      } else {
        const response = await apiService.createProduct(data)
        if (response.success) {
          loadProducts()
          setError(null)
        } else {
          setError(response.error || 'Failed to create product')
        }
      }
    } catch (err) {
      setError('Failed to save product')
      throw err
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Products</h2>
            <p className="text-gray-600">Manage your product catalog and inventory.</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Product Catalog ({pagination.totalElements} items)
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div style={{ height: '600px', width: '100%' }}>
            <AgGridReact<ProductRowData>
              theme="legacy"
              rowData={allProducts}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={pagination.size}
              paginationPageSizeSelector={[10, 20, 50]}
              suppressPaginationPanel={false}
              loading={loading}
              onGridReady={onGridReady}
              onPaginationChanged={onPaginationChanged}
              onSortChanged={onSortChanged}
              domLayout="normal"
              suppressRowClickSelection={true}
              enableCellTextSelection={true}
              ensureDomOrder={true}
              suppressMenuHide={true}
              rowHeight={50}
              rowModelType="clientSide"
              className="ag-theme-alpine"
            />
          </div>
          
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div>
              Showing {pagination.page * pagination.size + 1} to{' '}
              {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
              {pagination.totalElements} entries
            </div>
            <div>
              {pagination.totalElements} total items
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductModal
        open={modalOpen}
        onClose={handleModalClose}
        product={editingProduct}
        onSubmit={handleModalSubmit}
        isEdit={isEdit}
      />
    </div>
  )
}