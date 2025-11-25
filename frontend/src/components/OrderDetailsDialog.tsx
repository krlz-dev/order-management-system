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
  Calendar, 
  DollarSign,
  Hash,
  ShoppingBag
} from 'lucide-react'
import type { Order } from '@/types'

interface OrderDetailsDialogProps {
  open: boolean
  onClose: () => void
  order: Order | null
}

export function OrderDetailsDialog({ open, onClose, order }: OrderDetailsDialogProps) {
  if (!order) return null

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTotalQuantity = () => {
    return order.orderItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order Details
          </DialogTitle>
          <DialogDescription>
            View complete order information including items, pricing, and order status.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Hash className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                    <p className="font-semibold">#{order.id.slice(-8)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Order Date</p>
                    <p className="font-semibold text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Products</p>
                    <p className="font-semibold">{getTotalQuantity()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Price</p>
                    <p className="font-semibold text-lg text-green-600">{formatCurrency(order.totalPrice)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Items ({order.orderItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{item.productName}</h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Unit Price:</span>
                          <span className="font-medium">{formatCurrency(item.unitPrice)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Quantity:</span>
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">Product ID:</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {item.productId.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm text-gray-500">Subtotal</div>
                      <div className="font-bold text-lg">{formatCurrency(item.itemTotal)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold">Order Total</h3>
                    <p className="text-sm text-gray-500">
                      {getTotalQuantity()} items • {order.orderItems.length} products
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(order.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Order Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-left">
                <div>
                  <span className="text-gray-500 block">Created:</span>
                  <span className="font-medium">{formatDate(order.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Full Order ID:</span>
                  <span className="font-mono text-sm">{order.id}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Number of Products:</span>
                  <span className="font-medium">{order.orderItems.length}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Quantity:</span>
                  <span className="font-medium">{getTotalQuantity()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}