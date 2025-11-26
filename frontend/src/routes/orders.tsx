import { createFileRoute, useLoaderData, useNavigate, useSearch } from '@tanstack/react-router'
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
import { useOrders } from '@/hooks/useOrders'

const columnHelper = createColumnHelper<Order>()

interface OrdersSearch {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  search?: string
}

export const Route = createFileRoute('/orders')({
  validateSearch: (search: Record<string, unknown>): OrdersSearch => {
    return {
      page: Number(search.page) || 0,
      size: Number(search.size) || 10,
      sortBy: (search.sortBy as string) || 'createdAt',
      sortDir: (search.sortDir as 'asc' | 'desc') || 'desc',
      search: search.search as string | undefined,
    }
  },
  loader: ({ context, search }) => {
    const params = {
      page: search?.page ?? 0,
      size: search?.size ?? 10,
      sortBy: search?.sortBy ?? 'createdAt',
      sortDir: search?.sortDir ?? 'desc',
      search: search?.search
    }
    return context.queryClient.fetchQuery({
      queryKey: ['orders', params],
      queryFn: () => apiService.getOrders(params),
      staleTime: 0, // force refetch every navigation
    })
  },
  component: CustomerOrders,
})

function CustomerOrders() {
  const initialData = useLoaderData({ from: '/orders' })
  const navigate = useNavigate({ from: '/orders' })
  const search = useSearch({ from: '/orders' })
  
  // Initialize local state from URL parameters (only for UI state)
  const [searchQuery, setSearchQuery] = useState(search?.search || '')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const {
    orders,
    pagination,
    isLoading,
    error,
    refetch,
    createOrder,
    createError
  } = useOrders({
    page: search?.page ?? 0,
    size: search?.size ?? 10,
    sortBy: search?.sortBy ?? 'createdAt',
    sortDir: search?.sortDir ?? 'desc',
    search: search?.search
  })

  // Sorting state derived from URL for TanStack Table
  const sorting = useMemo(() => [
    { id: search?.sortBy || 'createdAt', desc: (search?.sortDir || 'desc') === 'desc' }
  ], [search?.sortBy, search?.sortDir])
  
  // Define table columns
  const columns = [
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
        const isCurrentSort = (search?.sortBy || 'createdAt') === 'totalPrice'
        const isDesc = (search?.sortDir || 'desc') === 'desc'
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newSortDir = isCurrentSort ? (isDesc ? 'asc' : 'desc') : 'desc'
              navigate({
                search: (prev) => ({
                  ...prev,
                  page: 0,
                  sortBy: 'totalPrice',
                  sortDir: newSortDir
                })
              })
            }}
            className="p-0 h-auto font-semibold hover:bg-transparent"
          >
            Total Price
            {isCurrentSort ? (
              isDesc ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : (
                <ChevronUp className="ml-2 h-4 w-4" />
              )
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
        const isCurrentSort = (search?.sortBy || 'createdAt') === 'createdAt'
        const isDesc = (search?.sortDir || 'desc') === 'desc'
        return (
          <Button
            variant="ghost"
            onClick={() => {
              const newSortDir = isCurrentSort ? (isDesc ? 'asc' : 'desc') : 'desc'
              navigate({
                search: (prev) => ({
                  ...prev,
                  page: 0,
                  sortBy: 'createdAt',
                  sortDir: newSortDir
                })
              })
            }}
            className="p-0 h-auto font-semibold hover:bg-transparent"
          >
            Order Date
            {isCurrentSort ? (
              isDesc ? (
                <ChevronDown className="ml-2 h-4 w-4" />
              ) : (
                <ChevronUp className="ml-2 h-4 w-4" />
              )
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
                <DropdownMenuItem onClick={() => navigate({ search: (prev) => ({ ...prev }) })}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ]

  // Create table instance
  const table = useReactTable({
    data: orders || [],
    columns,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination: {
        pageIndex: search?.page ?? 0,
        pageSize: search?.size ?? 10,
      },
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: pagination?.totalPages || 1,
  })

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setGlobalFilter(query)
    navigate({
      search: (prev) => ({
        ...prev,
        page: 0, // Reset to first page when searching
        search: query || undefined
      })
    })
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setGlobalFilter('')
    navigate({
      search: (prev) => {
        const newSearch = { ...prev, page: 0 }
        delete newSearch.search
        return newSearch
      }
    })
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
            onClick={() => refetch()}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
                placeholder="Search customer..."
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
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
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div></TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
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
          
          {/* Server-side pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              {pagination && (
                <>Showing {(search?.page ?? 0) * (search?.size ?? 10) + 1} to{' '}
                {Math.min(((search?.page ?? 0) + 1) * (search?.size ?? 10), pagination.totalElements)} of{' '}
                {pagination.totalElements} entries</>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Rows per page</p>
                <select
                  value={search?.size ?? 10}
                  onChange={(e) => {
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        page: 0,
                        size: Number(e.target.value)
                      })
                    })
                  }}
                  className="h-8 w-[70px] rounded border border-input bg-background px-3 py-0 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {(search?.page ?? 0) + 1} of{" "}
                {pagination?.totalPages || 1}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => navigate({ search: (prev) => ({ ...prev, page: 0 }) })}
                  disabled={!pagination || pagination.first}
                >
                  <span className="sr-only">Go to first page</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.85355 3.14645C7.04882 3.34171 7.04882 3.65829 6.85355 3.85355L3.70711 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H3.70711L6.85355 11.1464C7.04882 11.3417 7.04882 11.6583 6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.14645 7.85355C1.95118 7.65829 1.95118 7.34171 2.14645 7.14645L6.14645 3.14645C6.34171 2.95118 6.65829 2.95118 6.85355 3.14645Z" fill="currentColor"></path>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => navigate({ search: (prev) => ({ ...prev, page: Math.max(0, (prev.page || 0) - 1) }) })}
                  disabled={!pagination || pagination.first}
                >
                  <span className="sr-only">Go to previous page</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor"></path>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    navigate({ search: (prev) => ({ ...prev, page: Math.min((pagination?.totalPages || 1) - 1, (prev.page || 0) + 1) }) })
                  }}
                  disabled={!pagination || pagination.last}
                >
                  <span className="sr-only">Go to next page</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor"></path>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    navigate({ search: (prev) => ({ ...prev, page: (pagination?.totalPages || 1) - 1 }) })
                  }}
                  disabled={!pagination || pagination.last}
                >
                  <span className="sr-only">Go to last page</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.14645 11.1464C1.95118 10.9512 1.95118 10.6346 2.14645 10.4393L5.29289 7.29289C5.68342 6.90237 6.31658 6.90237 6.70711 7.29289L9.85355 10.4393C10.0488 10.6346 10.0488 10.9512 9.85355 11.1464C9.65829 11.3417 9.34171 11.3417 9.14645 11.1464L6.70711 8.70711C6.31658 8.31658 5.68342 8.31658 5.29289 8.70711L2.85355 11.1464C2.65829 11.3417 2.34171 11.3417 2.14645 11.1464Z" fill="currentColor"></path>
                  </svg>
                </Button>
              </div>
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