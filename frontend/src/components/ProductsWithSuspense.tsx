import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Products } from '@/pages/Products'

// Error fallback component
function ProductsErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Failed to load products: {error.message}</p>
          <button
            onClick={resetErrorBoundary}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function ProductsLoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Products</h2>
            <p className="text-gray-600">Browse and add products to your cart.</p>
          </div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="mb-6">
            <div className="h-10 w-72 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1 mr-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-3 w-24"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-4 bg-white">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component with modern React patterns
export function ProductsWithSuspense() {
  return (
    <ErrorBoundary
      FallbackComponent={ProductsErrorFallback}
      onReset={() => {
        // Reset any global state if needed
        window.location.reload()
      }}
    >
      <Suspense fallback={<ProductsLoadingFallback />}>
        <Products />
      </Suspense>
    </ErrorBoundary>
  )
}