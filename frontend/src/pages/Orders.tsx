import { useState, useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import type { ColDef, PaginationChangedEvent, SortChangedEvent, GridReadyEvent } from 'ag-grid-community'
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
import { ShoppingCart, Eye, MoreVertical, Download, RefreshCw } from 'lucide-react'
import type { Order } from '@/types'
import { OrderDetailsDialog } from '@/components/OrderDetailsDialog'
import { useOrders } from '@/hooks/useOrders'

interface OrderRowData extends Order {
  actions?: string
}

export function MyOrders() {
  // Local state for UI controls
  const [queryParams, setQueryParams] = useState({
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'desc' as 'asc' | 'desc'
  })
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Use React Query hook
  const {
    orders,
    pagination,
    isLoading,
    error,
    refetch,
    createOrder,
    isCreating,
    createError
  } = useOrders(queryParams)

  // Combine all errors
  const allErrors = [error, createError].filter(Boolean).join(', ')

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
      headerName: 'Total Items',
      field: 'totalItems',
      sortable: true,
      filter: 'agNumberColumnFilter',
      flex: 1,
      minWidth: 100,
      valueFormatter: (params) => params.value?.toString() || '0'
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
          .map((item: any) => `${item.productName || 'Unknown'} (${item.quantity})`)
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
    refetch()
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h2>
          <p className="text-gray-600">View and track all your orders.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Management ({pagination?.totalElements || 0} orders)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allErrors && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {allErrors}
            </div>
          )}
          
          <div style={{ height: '600px', width: '100%' }}>
            <AgGridReact<OrderRowData>
              theme="legacy"
              rowData={orders}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={pagination?.size || 10}
              paginationPageSizeSelector={[10, 20, 50]}
              suppressPaginationPanel={false}
              loading={isLoading || isCreating}
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
              rowCount={pagination?.totalElements || 0}
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
              {pagination?.totalElements || 0} total orders
            </div>
          </div>
        </CardContent>
      </Card>

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