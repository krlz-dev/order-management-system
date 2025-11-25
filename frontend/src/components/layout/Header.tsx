import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'
import { useCart } from '@/hooks/useCart'
import { useToastStore } from '@/store/useToastStore'
import { CartView } from '@/components/CartView'
import { Menu, ShoppingCart, User, LogOut } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  title: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  const [cartOpen, setCartOpen] = useState(false)
  const { user, logout, setCurrentPage } = useAppStore()
  const { getTotalItems } = useCart()
  const { addToast } = useToastStore()
  const totalItems = getTotalItems()

  const handleLogout = () => {
    logout()
  }

  const handleCartClick = () => {
    setCartOpen(true)
  }

  const handleOrderCreated = () => {
    // Navigate to Products page
    setCurrentPage('products')
    
    // Show success notification
    addToast({
      type: 'success',
      title: 'Order Created Successfully!',
      description: 'Your order has been placed and is being processed.',
      duration: 4000
    })
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative hover:bg-gray-100"
            onClick={handleCartClick}
            title="Shopping Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Button>
          
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="hover:bg-red-50 hover:text-red-600"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <CartView 
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </>
  )
}