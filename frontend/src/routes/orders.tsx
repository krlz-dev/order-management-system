import { createFileRoute, useLoaderData } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnFiltersState
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ShoppingCart, Eye, MoreVertical, Download, RefreshCw, Search, X, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { Order } from '@/types'
import { OrderDetailsDialog } from '@/components/OrderDetailsDialog'
import { apiService } from '@/services/api'

const columnHelper = createColumnHelper<Order>()

export const Route = createFileRoute('/orders')({
  loader: ({ context }) => {
    return context.queryClient.fetchQuery({
      queryKey: ['orders', { page: 0, size: 10, sortBy: 'createdAt', sortDir: 'desc' }],
      queryFn: () => apiService.getOrders({ page: 0, size: 10, sortBy: 'createdAt', sortDir: 'desc' }),
      staleTime: 0, // force refetch every navigation
    })
  },
  component: CustomerOrders,
})

function CustomerOrders() {
  const initialData = useLoaderData({ from: '/orders' })
  
  // Local state for UI controls
  const [searchQuery, setSearchQuery] = useState('')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const orders = initialData?.data?.content || []
  const pagination = initialData?.data
  
  // Define table columns
  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: 'Order ID',
      cell: ({ row }) => {
        const id = row.getValue('id') as string
        return <div className="font-medium">#{id ? id.slice(-8) : ''}</div>
      }
    }),
    columnHelper.accessor('userEmail', {
      header: 'Customer',
      cell: ({ row }) => {
        const userEmail = row.getValue('userEmail') as string | null
        return (
          <div className="font-medium">
            {userEmail || 'Legacy Order'}
          </div>
        )
      }
    }),
    columnHelper.accessor('totalPrice', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-auto font-semibold hover:bg-transparent"
          >
            Total Price
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalPrice'))
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)
        return <div>{formatted}</div>
      },
    }),
    columnHelper.accessor('createdAt', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-auto font-semibold hover:bg-transparent"
          >
            Order Date
            {column.getIsSorted() === 'asc' ? (
              <ChevronUp className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === 'desc' ? (
              <ChevronDown className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string
        if (!date) return ''
        return <div>{new Date(date).toLocaleString()}</div>
      },
    }),
    columnHelper.accessor('orderItems', {
      header: 'Products',
      cell: ({ row }) => {
        const items = row.getValue('orderItems') as any[]
        if (!items || !Array.isArray(items)) return ''
        
        const products = items
          .map((item: any) => `${item.product?.name || item.productName || 'Unknown'} (${item.quantity || 0})`)
          .join(', ')
        
        const maxLength = 50
        if (products.length > maxLength) {
          return (
            <div className="flex items-center">
              <span title={products}>
                {products.substring(0, maxLength)}...
              </span>
            </div>
          )
        }
        
        return <div>{products}</div>
      }
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownloadInvoice(order)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ], [])

  // Create table instance
  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    manualPagination: false,
    manualSorting: false,
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setGlobalFilter(query)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setGlobalFilter('')
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const handleDownloadInvoice = (order: Order) => {
    console.log('Download invoice for order', order.id)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Orders</h2>
            <p className="text-gray-600">View and track all customer orders.</p>
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Order Management ({pagination?.totalElements || 0} orders)
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-10"
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Client-side pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
              {table.getFilteredRowModel().rows.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
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