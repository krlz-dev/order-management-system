import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'
import { useOrders } from '@/hooks/useOrders'
import { useProducts } from '@/hooks/useProducts'
import { 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Clock
} from 'lucide-react'

export function Dashboard() {
  const { 
    pingResponse, 
    isLoading, 
    error, 
    setPingResponse, 
    setLoading, 
    setError 
  } = useAppStore()
  
  // Fetch recent orders and products for dashboard metrics
  const { 
    orders, 
    pagination: ordersPagination, 
    isLoading: ordersLoading 
  } = useOrders({ 
    page: 0, 
    size: 50, // Get more data for analytics
    sortBy: 'createdAt', 
    sortDir: 'desc' 
  })
  
  const { 
    products, 
    pagination: productsPagination, 
    isLoading: productsLoading 
  } = useProducts({ 
    page: 0, 
    size: 100, // Get all products for analytics
    sortBy: 'name', 
    sortDir: 'asc' 
  })

  // Calculate dashboard metrics
  const dashboardMetrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    const totalOrders = ordersPagination?.totalElements || orders.length
    const totalProducts = productsPagination?.totalElements || products.length
    
    // Low stock products (stock <= 10)
    const lowStockProducts = products.filter(product => product.stock <= 10)
    
    // Recent orders (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) > sevenDaysAgo
    )
    
    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Top selling products based on order items
    const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}
    
    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        const productName = item.product?.name || item.productName || 'Unknown'
        const quantity = item.quantity || 0
        const revenue = (item.unitPrice || 0) * quantity
        
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, quantity: 0, revenue: 0 }
        }
        productSales[productName].quantity += quantity
        productSales[productName].revenue += revenue
      })
    })
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    
    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      averageOrderValue,
      topProducts
    }
  }, [orders, products, ordersPagination, productsPagination])
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handlePing = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiService.ping()
      
      if (response.success && response.data) {
        setPingResponse(response.data.message)
      } else {
        setError(response.error || 'Failed to ping server')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (ordersLoading || productsLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Real-time insights into your business performance and inventory.</p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardMetrics.totalRevenue)}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardMetrics.averageOrderValue)}</p>
                <p className="text-xs text-gray-500 mt-1">Per order</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalProducts}</p>
                <p className="text-xs text-gray-500 mt-1">In inventory</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alert Section */}
      {dashboardMetrics.lowStockProducts.length > 0 && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert ({dashboardMetrics.lowStockProducts.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dashboardMetrics.lowStockProducts.slice(0, 6).map(product => (
                <div key={product.id} className="bg-white p-3 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">Stock: {product.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardMetrics.recentOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">#{order.id.slice(-8)}</p>
                    <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                    <p className="text-xs text-blue-600">{order.totalItems || order.orderItems?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>
              ))}
              {dashboardMetrics.recentOrders.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardMetrics.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
              {dashboardMetrics.topProducts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No sales data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* System Status */}
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <Package className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button 
              onClick={handlePing} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Backend Connection'}
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {pingResponse && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
              <strong>✓ Connected:</strong> {pingResponse}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                !ordersLoading ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <p className="text-xs text-gray-600">Orders API</p>
            </div>
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                !productsLoading ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <p className="text-xs text-gray-600">Products API</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}