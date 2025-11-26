import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
                title="User Profile"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@example.com'}</p>
                {user && user.roles && user.roles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-1">Roles:</p>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role}
                          className="inline-block px-2 py-1 text-xs bg-teal-100 text-teal-800 rounded-full"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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