import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '@/services/api'
import type { OrderCreateRequest } from '@/types'

interface UseOrdersParams {
  page: number
  size: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  search?: string
}

export function useOrders(params: UseOrdersParams) {
  const queryClient = useQueryClient()

  const {
    data: ordersData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['orders', params],
    queryFn: () => apiService.getOrders(params),
    select: (data) => data.success ? data.data : null,
  })

  const createOrderMutation = useMutation({
    mutationFn: (orderData: OrderCreateRequest) => apiService.createOrder(orderData),
    onSuccess: () => {
      // Invalidate and refetch orders query
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  // Note: updateOrder and deleteOrder methods don't exist in apiService yet
  // const updateOrderMutation = useMutation({
  //   mutationFn: ({ id, data }: { id: string; data: any }) =>
  //     apiService.updateOrder(id, data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['orders'] })
  //   },
  // })

  // const deleteOrderMutation = useMutation({
  //   mutationFn: (id: string) => apiService.deleteOrder(id),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['orders'] })
  //   },
  // })

  return {
    // Data
    orders: ordersData?.content || [],
    pagination: ordersData ? {
      page: ordersData.page,
      size: ordersData.size,
      totalElements: ordersData.totalElements,
      totalPages: ordersData.totalPages,
      first: ordersData.first,
      last: ordersData.last
    } : null,
    
    // States
    isLoading,
    error: error?.message || null,
    
    // Actions
    refetch,
    createOrder: createOrderMutation.mutateAsync,
    
    // Mutation states
    isCreating: createOrderMutation.isPending,
    
    // Mutation errors
    createError: createOrderMutation.error?.message || null,
  }
}