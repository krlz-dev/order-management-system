import { Button } from '@/components/ui/button'
import { Link, useLocation } from '@tanstack/react-router'
import { 
  Package, 
  ShoppingCart, 
  Home,
  Archive,
  ClipboardList,
  X
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface MenuItem {
  icon: any
  label: string
  to: string
  badge?: number
}

const menuItems: MenuItem[] = [
  { icon: Home, label: 'Dashboard', to: '/' },
  { icon: ShoppingCart, label: 'Products', to: '/products' },
  { icon: ClipboardList, label: 'Customer Orders', to: '/orders' },
  { icon: Archive, label: 'Inventory', to: '/inventory' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()

  const handleNavigation = () => {
    onClose() // Close sidebar on mobile after navigation
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          background: 'linear-gradient(180deg, #2C4A4E 0%, #1E3438 100%)'
        }}
      >
        <div className="flex h-full flex-col text-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">OrderFlow</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    search={{}}
                    onClick={handleNavigation}
                    className={`flex items-center w-full justify-start gap-3 h-12 text-left text-white hover:bg-white/10 rounded-md px-3 transition-colors ${
                      location.pathname === item.to ? 'bg-white/20 hover:bg-white/25' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}