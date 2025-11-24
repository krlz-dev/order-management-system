import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Product, ProductCreateRequest } from '@/types'

interface ProductModalProps {
  open: boolean
  onClose: () => void
  product?: Product
  onSubmit: (data: ProductCreateRequest) => Promise<void>
  isEdit?: boolean
}

export function ProductModal({ open, onClose, product, onSubmit, isEdit = false }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductCreateRequest>({
    name: '',
    price: 0,
    stock: 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    if (product && isEdit) {
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock
      })
    } else {
      setFormData({
        name: '',
        price: 0,
        stock: 0
      })
    }
    setErrors({})
  }, [product, isEdit, open])

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Stock cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Failed to save product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductCreateRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter product name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
              placeholder="0"
              className={errors.stock ? 'border-red-500' : ''}
            />
            {errors.stock && (
              <p className="text-sm text-red-500">{errors.stock}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Add Product')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}