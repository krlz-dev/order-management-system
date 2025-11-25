import { Button } from '@/components/ui/button'
import { useAppStore, type PageType } from '@/store/useAppStore'
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
  page: PageType
  badge?: number
}

const menuItems: MenuItem[] = [
  { icon: Home, label: 'Dashboard', page: 'dashboard' },
  { icon: ShoppingCart, label: 'Products', page: 'products' },
  { icon: ClipboardList, label: 'My Orders', page: 'orders' },
  { icon: Archive, label: 'Inventory', page: 'inventory' },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentPage, setCurrentPage } = useAppStore()

  const handleNavigation = (page: PageType) => {
    setCurrentPage(page)
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
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation(item.page)}
                    className={`w-full justify-start gap-3 h-12 text-left text-white hover:bg-white/10 ${
                      currentPage === item.page ? 'bg-white/20 hover:bg-white/25' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {useAppStore.getState().user?.name || 'User'}
                </p>
                <p className="text-xs text-white/70 truncate">
                  {useAppStore.getState().user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}