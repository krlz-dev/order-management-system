import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2,
  Package,
  DollarSign,
  Check
} from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { apiService } from '@/services/api'
import { useToastStore } from '@/store/useToastStore'

interface CartViewProps {
  open: boolean
  onClose: () => void
  onOrderCreated?: () => void
}

export function CartView({ open, onClose, onOrderCreated }: CartViewProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToastStore()

  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    calculation,
    isCalculating
  } = useCart()

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateQuantity(productId, quantity)
  }

  const handleRemoveItem = (productId: string) => {
    removeItem(productId)
  }

  const handleConfirmOrder = async () => {
    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }

    // Check if all items are available based on backend calculation
    if (calculation) {
      const unavailableItems = calculation.items.filter(item => !item.available)
      if (unavailableItems.length > 0) {
        setError(`Some items are out of stock: ${unavailableItems.map(item => item.productName).join(', ')}`)
        return
      }
    }

    setSubmitting(true)
    setError(null)

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      }

      const response = await apiService.createOrder(orderData)
      
      if (response.success) {
        clearCart()
        addToast({
          type: 'success',
          title: 'Order Created Successfully!',
          description: `Your order has been placed successfully. Order ID: ${response.data?.id || 'N/A'}`,
          duration: 5000
        })
        onOrderCreated?.()
        onClose()
      } else {
        setError(response.error || 'Failed to create order')
      }
    } catch (err) {
      setError('Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart ({getTotalItems()} items)
          </DialogTitle>
          <DialogDescription>
            Review your selected items and proceed to checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Cart Items
                </div>
                <span className="text-sm font-normal text-green-600">
                  Total: ${getTotalPrice().toFixed(2)}
                  {isCalculating && <span className="ml-2 text-blue-500">(calculating...)</span>}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                  <Package className="w-12 h-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                  <p className="text-sm text-center">Add items to your cart to create an order</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    // Find backend calculation for this item
                    const calculatedItem = calculation?.items.find(calcItem => calcItem.productId === item.product.id)
                    const itemTotal = calculatedItem ? calculatedItem.itemTotal : (item.product.price * item.quantity)
                    const unitPrice = calculatedItem ? calculatedItem.unitPrice : item.product.price
                    const availableStock = calculatedItem ? calculatedItem.availableStock : item.product.stock
                    const isAvailable = calculatedItem ? calculatedItem.available : true
                    
                    return (
                    <Card key={item.product.id} className={`border ${!isAvailable ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg truncate">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              ${unitPrice.toFixed(2)} per unit
                            </p>
                            <p className={`text-sm ${!isAvailable ? 'text-red-600' : 'text-gray-500'}`}>
                              Stock available: {availableStock}
                              {!isAvailable && <span className="ml-1 font-medium">(Insufficient stock!)</span>}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${!isAvailable ? 'text-red-600' : 'text-green-600'}`}>
                              ${itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-lg font-medium w-12 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= availableStock}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Order Summary</span>
                <span className="flex items-center gap-1 text-green-600">
                  <DollarSign className="w-5 h-5" />
                  {getTotalPrice().toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Total Items: {getTotalItems()}</span>
                <span>Total Amount: ${getTotalPrice().toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Continue Shopping
          </Button>
          {items.length > 0 && (
            <Button
              onClick={handleConfirmOrder}
              disabled={submitting}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {submitting ? (
                'Creating Order...'
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Order (${getTotalPrice().toFixed(2)})
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}