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
  Clock,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

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
    isLoading: ordersLoading,
    refetch: refetchOrders 
  } = useOrders({ 
    page: 0, 
    size: 50, // Get more data for analytics
    sortBy: 'createdAt', 
    sortDir: 'desc' 
  })
  
  const { 
    products, 
    pagination: productsPagination, 
    isLoading: productsLoading,
    refetch: refetchProducts 
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

    // Chart data for sales over time (last 7 days)
    const salesData: Array<{ date: string; revenue: number; orders: number }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === date.toDateString()
      })
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
      
      salesData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      })
    }

    // Stock level distribution data
    const stockData = [
      { name: 'Low Stock (≤10)', value: products.filter(p => p.stock <= 10).length, color: 'hsl(var(--destructive))' },
      { name: 'Medium Stock (11-50)', value: products.filter(p => p.stock > 10 && p.stock <= 50).length, color: 'hsl(var(--primary-400))' },
      { name: 'High Stock (>50)', value: products.filter(p => p.stock > 50).length, color: 'hsl(var(--primary-600))' }
    ]
    
    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      lowStockProducts,
      recentOrders,
      averageOrderValue,
      topProducts,
      salesData,
      stockData
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

  const handleRefresh = async () => {
    await Promise.all([
      refetchOrders(),
      refetchProducts()
    ])
  }


  if (ordersLoading || productsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Monitor your business performance and inventory status.</p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={ordersLoading || productsLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${ordersLoading || productsLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* System Status */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Status</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${!ordersLoading && !productsLoading ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                    <p className="text-xs text-muted-foreground">APIs Online</p>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>
              <Button 
                onClick={handlePing} 
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                {isLoading ? 'Testing...' : 'Test Connection'}
              </Button>
              
              {error && (
                <div className="bg-yellow-50 text-yellow-700 p-2 rounded text-xs border border-yellow-200">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {pingResponse && (
                <div className="bg-primary/10 text-primary p-2 rounded text-xs border border-primary/20">
                  <strong className="text-primary">✓ Connected</strong>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-semibold text-foreground">{dashboardMetrics.totalOrders.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(dashboardMetrics.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
                <p className="text-2xl font-semibold text-foreground">{formatCurrency(dashboardMetrics.averageOrderValue)}</p>
                <p className="text-xs text-muted-foreground mt-1">Per order</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-2xl font-semibold text-foreground">{dashboardMetrics.totalProducts}</p>
                <p className="text-xs text-muted-foreground mt-1">In inventory</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Alert Section */}
      {dashboardMetrics.lowStockProducts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Low Stock Alert ({dashboardMetrics.lowStockProducts.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {dashboardMetrics.lowStockProducts.slice(0, 6).map(product => (
                <div key={product.id} className="bg-card p-3 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4" />
              Sales Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardMetrics.salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'calc(var(--radius) - 2px)'
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4" />
              Stock Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardMetrics.stockData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardMetrics.stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'calc(var(--radius) - 2px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {dashboardMetrics.stockData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardMetrics.recentOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">#{order.id.slice(-8)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    <p className="text-xs text-primary">{order.totalItems || order.orderItems?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>
              ))}
              {dashboardMetrics.recentOrders.length === 0 && (
                <p className="text-muted-foreground text-center py-4 text-sm">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardMetrics.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.quantity} sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
              {dashboardMetrics.topProducts.length === 0 && (
                <p className="text-muted-foreground text-center py-4 text-sm">No sales data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}