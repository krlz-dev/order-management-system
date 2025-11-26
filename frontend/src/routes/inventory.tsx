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
import { Package, Plus, Edit, Trash2, MoreVertical, Eye, Search, X, ChevronUp, ChevronDown, ChevronsUpDown, RefreshCw } from 'lucide-react'
import type { Product, ProductCreateRequest } from '@/types'
import { ProductModal } from '@/components/ProductModal'
import { ProductDetailsDialog } from '@/components/ProductDetailsDialog'
import { apiService } from '@/services/api'
import { useProducts } from '@/hooks/useProducts'

const columnHelper = createColumnHelper<Product>()

export const Route = createFileRoute('/inventory')({
  loader: ({ context }) => {
    return context.queryClient.fetchQuery({
      queryKey: ['products', { page: 0, size: 10, sortBy: 'name', sortDir: 'asc' }],
      queryFn: () => apiService.getProducts({ page: 0, size: 10, sortBy: 'name', sortDir: 'asc' }),
      staleTime: 0, // force refetch every navigation
    })
  },
  component: Inventory,
})

function Inventory() {
  const initialData = useLoaderData({ from: '/inventory' })
  const [searchQuery, setSearchQuery] = useState('')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false }
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [isEdit, setIsEdit] = useState(false)

  const {
    createProduct,
    updateProduct,
    deleteProduct,
    createError,
    updateError,
    deleteError
  } = useProducts({ page: 0, size: 10, sortBy: 'name', sortDir: 'asc' })

  const products = initialData?.data?.content || []
  const pagination = initialData?.data
  const filteredProducts = globalFilter 
    ? products.filter((product: any) => 
        product.name.toLowerCase().includes(globalFilter.toLowerCase())
      )
    : products

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-auto font-semibold hover:bg-transparent"
          >
            Name
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
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      )
    }),
    columnHelper.accessor('price', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-auto font-semibold hover:bg-transparent"
          >
            Price
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
        const amount = parseFloat(row.getValue('price'))
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)
        return <div>{formatted}</div>
      },
    }),
    columnHelper.accessor('stock', {
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="p-0 h-auto font-semibold hover:bg-transparent"
          >
            Stock
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
        const stock = row.getValue('stock') as number
        return (
          <div className={`font-medium ${stock <= 10 ? 'text-red-600' : ''}`}>
            {stock}
          </div>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const product = row.original
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
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuItem onClick={() => handleView(product)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Product
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ], [])

  const table = useReactTable({
    data: filteredProducts,
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

  const allErrors = [createError, updateError, deleteError].filter(Boolean).join(', ')

  const handleCreate = () => {
    setEditingProduct(undefined)
    setIsEdit(false)
    setModalOpen(true)
  }

  const handleView = (product: Product) => {
    setViewingProduct(product)
    setDetailsOpen(true)
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
      window.location.reload()
    } catch (err) {
      // Error is handled by the mutation
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setGlobalFilter(query)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setGlobalFilter('')
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
      handleModalClose()
      window.location.reload()
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
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
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

      <ProductModal
        open={modalOpen}
        onClose={handleModalClose}
        product={editingProduct}
        onSubmit={handleModalSubmit}
        isEdit={isEdit}
      />
      
      <ProductDetailsDialog
        open={detailsOpen}
        onClose={() => {
          setDetailsOpen(false)
          setViewingProduct(null)
        }}
        product={viewingProduct}
      />
    </div>
  )
}