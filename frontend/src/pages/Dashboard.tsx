import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/useAppStore'
import { apiService } from '@/services/api'
import { ShoppingCart, DollarSign, Users, Package } from 'lucide-react'

export function Dashboard() {
  const { 
    pingResponse, 
    isLoading, 
    error, 
    setPingResponse, 
    setLoading, 
    setError 
  } = useAppStore()

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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to OrderFlow</h2>
        <p className="text-gray-600">Manage your orders, customers, and inventory all in one place.</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$45,678</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">567</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Connection Test Card */}
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center">Server Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button 
              onClick={handlePing} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Pinging...' : 'Test Connection'}
            </Button>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
              Error: {error}
            </div>
          )}
          
          {pingResponse && (
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
              Server Response: {pingResponse}
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500">
            Test the connection to the Spring Boot backend
          </div>
        </CardContent>
      </Card>
    </div>
  )
}