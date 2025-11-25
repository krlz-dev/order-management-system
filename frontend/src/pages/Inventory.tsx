import { useState, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import type { ColDef, GridReadyEvent, PaginationChangedEvent, SortChangedEvent } from 'ag-grid-community'
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
import type { Product, ProductCreateRequest } from '@/types'
import { ProductModal } from '@/components/ProductModal'
import { useProducts } from '@/hooks/useProducts'

interface ProductRowData extends Product {
  actions?: string
}

export function Inventory() {
  // Local state for UI controls
  const [searchQuery, setSearchQuery] = useState('')
  const [queryParams, setQueryParams] = useState({
    page: 0,
    size: 10,
    sortBy: 'name',
    sortDir: 'asc' as 'asc' | 'desc'
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [isEdit, setIsEdit] = useState(false)

  // Use React Query hook
  const {
    products,
    pagination,
    isLoading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    isCreating,
    isUpdating,
    isDeleting,
    createError,
    updateError,
    deleteError
  } = useProducts(queryParams)

  // Create allProducts array for AG Grid (with placeholders)
  const allProducts = useMemo<ProductRowData[]>(() => {
    if (!pagination) return []
    
    const fullArray: ProductRowData[] = []
    const totalElements = pagination.totalElements
    const pageSize = pagination.size
    const currentPage = pagination.page
    
    // Fill the array with actual data and placeholders
    for (let i = 0; i < totalElements; i++) {
      const pageIndex = Math.floor(i / pageSize)
      const indexInPage = i % pageSize
      
      if (pageIndex === currentPage && indexInPage < products.length) {
        // Current page data
        fullArray[i] = products[indexInPage]
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
    
    return fullArray
  }, [products, pagination])

  // Combine all errors
  const allErrors = [error, createError, updateError, deleteError].filter(Boolean).join(', ')

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


  const onGridReady = () => {
    // Grid ready handler - no longer needed for pagination sync
  }

  const onPaginationChanged = (event: PaginationChangedEvent) => {
    const currentPage = event.api.paginationGetCurrentPage()
    const pageSize = event.api.paginationGetPageSize()
    
    // Handle page size changes
    if (pageSize !== queryParams.size) {
      setQueryParams(prev => ({
        ...prev,
        page: 0, // Reset to first page when page size changes
        size: pageSize
      }))
      return
    }
    
    // Handle page navigation
    if (currentPage !== queryParams.page) {
      setQueryParams(prev => ({
        ...prev,
        page: currentPage
      }))
    }
  }

  const onSortChanged = (event: SortChangedEvent) => {
    const sortModel = event.api.getColumnState().find(col => col.sort)
    if (sortModel) {
      const newSortBy = sortModel.colId
      const newSortDir = sortModel.sort === 'desc' ? 'desc' : 'asc'
      setQueryParams(prev => ({
        ...prev,
        page: 0, // Reset to first page when sorting
        sortBy: newSortBy,
        sortDir: newSortDir
      }))
    }
  }

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
      await deleteProduct(id)
    } catch (err) {
      // Error is handled by the mutation
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setQueryParams(prev => ({
      ...prev,
      page: 0, // Reset to first page when searching
      search: query || undefined
    }))
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setQueryParams(prev => {
      const newParams = { ...prev }
      delete newParams.search
      return {
        ...newParams,
        page: 0
      }
    })
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingProduct(undefined)
    setIsEdit(false)
  }

  const handleModalSubmit = async (data: ProductCreateRequest) => {
    try {
      if (isEdit && editingProduct) {
        await updateProduct({ id: editingProduct.id, data })
      } else {
        await createProduct(data)
      }
      // Close modal on success
      handleModalClose()
    } catch (err) {
      // Error is handled by the mutations
      throw err
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory</h2>
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
              Product Catalog ({pagination?.totalElements || 0} items)
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
          {allErrors && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {allErrors}
            </div>
          )}
          
          <div style={{ height: '600px', width: '100%' }}>
            <AgGridReact<ProductRowData>
              theme="legacy"
              rowData={allProducts}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={pagination?.size || 10}
              paginationPageSizeSelector={[10, 20, 50]}
              suppressPaginationPanel={false}
              loading={isLoading || isCreating || isUpdating || isDeleting}
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
              {pagination && (
                <>
                  Showing {pagination.page * pagination.size + 1} to{' '}
                  {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
                  {pagination.totalElements} entries
                </>
              )}
            </div>
            <div>
              {pagination?.totalElements || 0} total items
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