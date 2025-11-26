import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { useAppStore } from '@/store/useAppStore'
import { useAuthValidation } from '@/hooks/useAuthValidation'
import { Login } from '@/pages'
import { ToastContainer } from '@/components/ToastContainer'
import { createAppRouter } from '@/router'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Create the router
const router = createAppRouter(queryClient)

function App() {
  const { isAuthenticated } = useAppStore()
  
  // Validate token on app startup and periodically
  useAuthValidation()

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <Login />
        <ToastContainer />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App