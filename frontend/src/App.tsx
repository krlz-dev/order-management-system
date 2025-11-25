import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store/useAppStore'
import { useAuthValidation } from '@/hooks/useAuthValidation'
import { 
  Dashboard, 
  MyOrders, 
  Products,
  Inventory,
  Login 
} from '@/pages'
import { ToastContainer } from '@/components/ToastContainer'

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

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentPage, isAuthenticated } = useAppStore()
  
  // Validate token on app startup and periodically
  useAuthValidation()

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <Login />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'orders':
        return <MyOrders />
      case 'products':
        return <Products />
      case 'inventory':
        return <Inventory />
      default:
        return <Dashboard />
    }
  }

  const getPageTitle = () => {
    return currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <div className="lg:ml-64 flex flex-col min-h-screen">
          {/* Header */}
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            title={getPageTitle()}
          />
          
          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-6">
            {renderCurrentPage()}
          </main>
        </div>
      </div>
      <ToastContainer />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App