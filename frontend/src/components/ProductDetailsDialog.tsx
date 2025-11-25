import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package, 
  DollarSign,
  Hash,
  Boxes,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import type { Product } from '@/types'

interface ProductDetailsDialogProps {
  open: boolean
  onClose: () => void
  product: Product | null
}

export function ProductDetailsDialog({ open, onClose, product }: ProductDetailsDialogProps) {
  if (!product) return null

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  
  // const formatDate = (dateString?: string) => {
  //   if (!dateString) return 'N/A'
  //   return new Date(dateString).toLocaleString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     second: '2-digit'
  //   })
  // }

  const getStockStatus = () => {
    if (product.stock <= 0) {
      return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle }
    } else if (product.stock <= 10) {
      return { text: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', icon: AlertTriangle }
    } else {
      return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle }
    }
  }

  const stockStatus = getStockStatus()
  const StatusIcon = stockStatus.icon

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Details
          </DialogTitle>
          <DialogDescription>
            View complete product information including pricing, stock levels, and details.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Product Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Hash className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Product ID</p>
                    <p className="font-semibold">#{product.id.slice(-8)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                    <p className="font-semibold text-lg text-green-600">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Boxes className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Stock Level</p>
                    <p className={`font-semibold ${product.stock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                      {product.stock} units
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`${stockStatus.bg} ${stockStatus.border} border`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <StatusIcon className={`w-8 h-8 ${stockStatus.color}`} />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                    <p className={`font-semibold ${stockStatus.color}`}>{stockStatus.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">{product.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Product ID:</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {product.id}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Unit Price:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(product.price)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Stock Quantity:</span>
                        <span className={`font-semibold ${product.stock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                          {product.stock} units
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Total Value:</span>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(product.price * product.stock)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Stock Status:</span>
                        <span className={`font-semibold ${stockStatus.color} flex items-center gap-1`}>
                          <StatusIcon className="w-4 h-4" />
                          {stockStatus.text}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock Level Indicator */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Stock Level Indicator</h4>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        product.stock <= 5 ? 'bg-red-500' :
                        product.stock <= 10 ? 'bg-orange-500' :
                        product.stock <= 20 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ 
                        width: `${Math.min((product.stock / Math.max(product.stock, 50)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span className="font-medium">{product.stock} units</span>
                    <span>High Stock</span>
                  </div>
                </div>

                {/* Recommendations */}
                {product.stock <= 10 && (
                  <div className={`${stockStatus.bg} ${stockStatus.border} border rounded-lg p-4`}>
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-5 h-5 ${stockStatus.color} flex-shrink-0 mt-0.5`} />
                      <div>
                        <h4 className={`font-semibold ${stockStatus.color}`}>
                          {product.stock <= 0 ? 'Restock Required' : 'Low Stock Warning'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {product.stock <= 0 
                            ? 'This product is out of stock. Consider restocking immediately to avoid lost sales.'
                            : `Only ${product.stock} units remaining. Consider reordering to maintain adequate inventory levels.`
                          }
                        </p>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Recommended action: Order at least 20-50 units to maintain healthy stock levels.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button className="w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                  📝 Edit Product Details
                </button>
                <button className="w-full text-left p-2 text-sm bg-green-50 hover:bg-green-100 rounded-md transition-colors">
                  📦 Update Stock Level
                </button>
                <button className="w-full text-left p-2 text-sm bg-purple-50 hover:bg-purple-100 rounded-md transition-colors">
                  💰 Update Price
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Product Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inventory Value:</span>
                    <span className="font-semibold">{formatCurrency(product.price * product.stock)}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days to Restock:</span>
                    <span className="font-semibold">
                      {product.stock <= 5 ? 'Immediate' : product.stock <= 10 ? '1-2 days' : '1-2 weeks'}
                    </span>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority Level:</span>
                    <span className={`font-semibold ${
                      product.stock <= 5 ? 'text-red-600' : 
                      product.stock <= 10 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {product.stock <= 5 ? 'High' : product.stock <= 10 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}