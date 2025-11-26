import { createRootRouteWithContext, Outlet, useMatches } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { useState } from 'react'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const matches = useMatches()

  const pathname = matches[matches.length - 1]?.pathname || '/'
  const getTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Dashboard'
      case '/products':
        return 'Products'
      case '/orders':
        return 'Orders'
      case '/inventory':
        return 'Inventory'
      default:
        return 'Dashboard'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          title={getTitle(pathname)}
        />

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}