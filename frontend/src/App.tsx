import { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAppStore } from '@/store/useAppStore'
import { 
  Dashboard, 
  Orders, 
  Products, 
  Customers, 
  Settings 
} from '@/pages'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { currentPage } = useAppStore()

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'orders':
        return <Orders />
      case 'products':
        return <Products />
      case 'customers':
        return <Customers />
      case 'settings':
        return <Settings />
      case 'shipping':
      case 'payments':
      case 'analytics':
        return (
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
              </h2>
              <p className="text-gray-600">This page is coming soon.</p>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  const getPageTitle = () => {
    return currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
  }

  return (
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
  )
}

export default App