import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api'
import type { ProductCreateRequest } from '@/types'

interface UseProductsParams {
  page: number
  size: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  search?: string
}

export function useProducts(params: UseProductsParams) {
  const queryClient = useQueryClient()

  console.log('🔥 useProducts called with params:', params)

  const {
    data: productsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['products', params],
    queryFn: () => {
      console.log('🔥 API call with params:', params)
      return apiService.getProducts(params)
    },
    select: (data) => data.success ? data.data : null,
  })

  const createProductMutation = useMutation({
    mutationFn: (productData: ProductCreateRequest) => apiService.createProduct(productData),
    onSuccess: () => {
      // Invalidate and refetch products query
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductCreateRequest }) =>
      apiService.updateProduct(id, data),
    onSuccess: () => {
      // Invalidate and refetch products query
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => apiService.deleteProduct(id),
    onSuccess: () => {
      // Invalidate and refetch products query
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return {
    // Data
    products: productsData?.content || [],
    pagination: productsData ? {
      page: productsData.page,
      size: productsData.size,
      totalElements: productsData.totalElements,
      totalPages: productsData.totalPages
    } : null,
    
    // States
    isLoading,
    error: error?.message || null,
    
    // Actions
    refetch,
    createProduct: createProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    
    // Mutation states
    isCreating: createProductMutation.isPending,
    isUpdating: updateProductMutation.isPending,
    isDeleting: deleteProductMutation.isPending,
    
    // Mutation errors
    createError: createProductMutation.error?.message || null,
    updateError: updateProductMutation.error?.message || null,
    deleteError: deleteProductMutation.error?.message || null,
  }
}