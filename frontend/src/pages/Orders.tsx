import { useState, useEffect, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import type { ColDef, PaginationChangedEvent, SortChangedEvent, GridReadyEvent, GridApi } from 'ag-grid-community'
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
import { ShoppingCart, Plus, Eye, MoreVertical, Download, RefreshCw } from 'lucide-react'
import { apiService } from '@/services/api'
import type { Order, PaginationParams } from '@/types'
import { OrderCreationDialog } from '@/components/OrderCreationDialog'
import { OrderDetailsDialog } from '@/components/OrderDetailsDialog'

interface OrderRowData extends Order {
  actions?: string
}

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })
  const [sortModel, setSortModel] = useState({
    sortBy: 'createdAt',
    sortDir: 'desc' as 'asc' | 'desc'
  })
  const [createOrderOpen, setCreateOrderOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const columnDefs = useMemo<ColDef<OrderRowData>[]>(() => [
    {
      headerName: 'Order ID',
      field: 'id',
      sortable: true,
      filter: true,
      flex: 2,
      minWidth: 200,
      valueFormatter: (params) => params.value ? `#${params.value.slice(-8)}` : ''
    },
    {
      headerName: 'Total Price',
      field: 'totalPrice',
      sortable: true,
      filter: 'agNumberColumnFilter',
      flex: 1,
      minWidth: 120,
      valueFormatter: (params) => `$${params.value?.toFixed(2) || '0.00'}`
    },
    {
      headerName: 'Order Date',
      field: 'createdAt',
      sortable: true,
      filter: 'agDateColumnFilter',
      flex: 2,
      minWidth: 180,
      valueFormatter: (params) => {
        if (!params.value) return ''
        return new Date(params.value).toLocaleString()
      }
    },
    {
      headerName: 'Products',
      field: 'orderItems',
      sortable: false,
      filter: false,
      flex: 3,
      minWidth: 200,
      cellRenderer: (params: any) => {
        if (!params.value || !Array.isArray(params.value)) return ''
        
        const products = params.value
          .map((item: any) => `${item.product?.name || 'Unknown'} (${item.quantity})`)
          .join(', ')
        
        const maxLength = 50
        if (products.length > maxLength) {
          return (
            <div className="flex items-center h-full">
              <span title={products}>
                {products.substring(0, maxLength)}...
              </span>
            </div>
          )
        }
        
        return (
          <div className="flex items-center h-full">
            <span>{products}</span>
          </div>
        )
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
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem onClick={() => handleViewDetails(params.data)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadInvoice(params.data)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleRefreshOrder(params.data.id)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ], [])

  const loadOrders = useCallback(async (page?: number, size?: number, sortBy?: string, sortDir?: 'asc' | 'desc') => {
    setLoading(true)
    setError(null)
    
    const currentPage = page !== undefined ? page : pagination.page
    const currentSize = size !== undefined ? size : pagination.size
    const currentSortBy = sortBy || sortModel.sortBy
    const currentSortDir = sortDir || sortModel.sortDir
    
    try {
      const response = await apiService.getOrders({
        page: currentPage,
        size: currentSize,
        sortBy: currentSortBy,
        sortDir: currentSortDir
      })
      
      if (response.success && response.data) {
        setOrders(response.data.content)
        setPagination({
          page: response.data.page,
          size: response.data.size,
          totalElements: response.data.totalElements,
          totalPages: response.data.totalPages
        })
        if (sortBy && sortDir) {
          setSortModel({ sortBy: currentSortBy, sortDir: currentSortDir })
        }
        
        // Sync AG Grid pagination with server response
        if (gridApi) {
          gridApi.paginationGoToPage(response.data.page)
        }
      } else {
        setError(response.error || 'Failed to load orders')
      }
    } catch (err) {
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.size, sortModel.sortBy, sortModel.sortDir])

  useEffect(() => {
    loadOrders()
  }, [])

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
  }, [])

  const onPaginationChanged = useCallback((event: PaginationChangedEvent) => {
    const currentPage = event.api.paginationGetCurrentPage()
    const pageSize = event.api.paginationGetPageSize()
    
    console.log('Orders pagination changed:', { currentPage, pageSize, statePage: pagination.page, stateSize: pagination.size })
    
    // Handle page size changes
    if (pageSize !== pagination.size) {
      console.log('Orders page size changed, loading with new size:', pageSize)
      loadOrders(0, pageSize) // Reset to first page when page size changes
      return
    }
    
    // Handle page navigation
    if (currentPage !== pagination.page) {
      console.log('Orders page navigation, loading page:', currentPage)
      loadOrders(currentPage)
    }
  }, [loadOrders, pagination.page, pagination.size])

  const onSortChanged = useCallback((event: SortChangedEvent) => {
    const sortModel = event.api.getColumnState().find(col => col.sort)
    if (sortModel) {
      const newSortBy = sortModel.colId
      const newSortDir = sortModel.sort === 'desc' ? 'desc' : 'asc'
      loadOrders(0, undefined, newSortBy, newSortDir) // Reset to first page when sorting
    }
  }, [loadOrders])

  const handleCreateOrder = () => {
    setCreateOrderOpen(true)
  }

  const handleOrderCreated = () => {
    loadOrders() // Refresh the orders list
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const handleDownloadInvoice = (order: Order) => {
    // TODO: Implement invoice download
    console.log('Download invoice for order', order.id)
  }

  const handleRefreshOrder = async (orderId: string) => {
    // TODO: Implement order refresh functionality
    console.log('Refresh order status', orderId)
    // For now, just reload the current page
    loadOrders()
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders</h2>
            <p className="text-gray-600">Manage and track all customer orders.</p>
          </div>
          <Button onClick={handleCreateOrder} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Order
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Management ({pagination.totalElements} orders)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div style={{ height: '600px', width: '100%' }}>
            <AgGridReact<OrderRowData>
              theme="legacy"
              rowData={orders}
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
              rowHeight={60}
              rowModelType="clientSide"
              suppressServerSideInfiniteScroll={true}
              paginationAutoPageSize={false}
              rowBuffer={0}
              className="ag-theme-alpine"
              // Force AG Grid to show correct total rows for server-side pagination
              rowCount={pagination.totalElements}
            />
          </div>
          
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div>
              Showing {pagination.page * pagination.size + 1} to{' '}
              {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} of{' '}
              {pagination.totalElements} entries
            </div>
            <div>
              {pagination.totalElements} total orders
            </div>
          </div>
        </CardContent>
      </Card>

      <OrderCreationDialog
        open={createOrderOpen}
        onClose={() => setCreateOrderOpen(false)}
        onOrderCreated={handleOrderCreated}
      />

      <OrderDetailsDialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
      />
    </div>
  )
}